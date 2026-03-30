'use client';

import { useCallback, useRef, useState } from 'react';
import { Download, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { decryptFile } from '@/lib/crypto';
import prettyBytes from 'pretty-bytes';

interface FileDownloadProps {
	fileId: string;
	fileName: string;
	fileSize: number;
	encrypted?: boolean;
	salt?: string;
	iv?: string;
}

type Stage = 'idle' | 'downloading' | 'decrypting' | 'done';

function formatSpeed(bytesPerSec: number): string {
	if (bytesPerSec === 0) return '0 B/s';
	return `${prettyBytes(bytesPerSec)}/s`;
}

function formatEta(seconds: number): string {
	if (!isFinite(seconds) || seconds <= 0) return '--';
	if (seconds < 60) return `${Math.ceil(seconds)}s`;
	const m = Math.floor(seconds / 60);
	const s = Math.ceil(seconds % 60);
	return `${m}m ${s}s`;
}

export default function FileDownload({ fileId, fileName, fileSize, encrypted, salt, iv }: FileDownloadProps) {
	const [password, setPassword] = useState('');
	const [stage, setStage] = useState<Stage>('idle');
	const [progress, setProgress] = useState(0);
	const [downloaded, setDownloaded] = useState(0);
	const [speed, setSpeed] = useState(0);
	const [eta, setEta] = useState(0);
	const blobUrlRef = useRef<string | null>(null);

	const triggerSave = useCallback((blob: Blob) => {
		const url = URL.createObjectURL(blob);
		blobUrlRef.current = url;
		const a = document.createElement('a');
		a.href = url;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		// Keep blob URL alive briefly so browser can finish saving
		setTimeout(() => {
			if (blobUrlRef.current) {
				URL.revokeObjectURL(blobUrlRef.current);
				blobUrlRef.current = null;
			}
		}, 60_000);
	}, [fileName]);

	const handleDownload = useCallback(async () => {
		if (encrypted && !password) {
			toast.error('enter the file password');
			return;
		}

		try {
			// Get presigned URL
			const res = await fetch(`/api/download/${fileId}?raw=1`);
			if (!res.ok) {
				toast.error(res.status === 410 ? 'file has expired' : 'failed to get download link');
				return;
			}
			const { url } = await res.json();

			// Stream download with progress via XHR
			setStage('downloading');
			setProgress(0);
			setDownloaded(0);
			setSpeed(0);
			setEta(0);

			const data = await new Promise<ArrayBuffer>((resolve, reject) => {
				const xhr = new XMLHttpRequest();
				xhr.responseType = 'arraybuffer';

				let startTime = Date.now();
				let lastLoaded = 0;
				let lastTime = startTime;

				xhr.addEventListener('progress', (e) => {
					const now = Date.now();
					const elapsed = (now - lastTime) / 1000;

					if (e.lengthComputable) {
						const pct = Math.round((e.loaded / e.total) * 100);
						setProgress(pct);
						setDownloaded(e.loaded);

						if (elapsed > 0.3) {
							const bytesPerSec = (e.loaded - lastLoaded) / elapsed;
							setSpeed(bytesPerSec);
							const remaining = e.total - e.loaded;
							setEta(bytesPerSec > 0 ? remaining / bytesPerSec : 0);
							lastLoaded = e.loaded;
							lastTime = now;
						}
					} else if (e.loaded > 0) {
						// No Content-Length, show bytes downloaded
						setDownloaded(e.loaded);
						if (elapsed > 0.3) {
							const bytesPerSec = (e.loaded - lastLoaded) / elapsed;
							setSpeed(bytesPerSec);
							if (fileSize > 0) {
								const remaining = fileSize - e.loaded;
								setProgress(Math.round((e.loaded / fileSize) * 100));
								setEta(bytesPerSec > 0 ? remaining / bytesPerSec : 0);
							}
							lastLoaded = e.loaded;
							lastTime = now;
						}
					}
				});

				xhr.addEventListener('load', () => {
					if (xhr.status >= 200 && xhr.status < 300) {
						setProgress(100);
						setDownloaded(xhr.response.byteLength);
						setSpeed(0);
						resolve(xhr.response);
					} else {
						reject(new Error(`download failed (${xhr.status})`));
					}
				});

				xhr.addEventListener('error', () => reject(new Error('network error')));

				xhr.open('GET', url);
				xhr.send();
			});

			// Decrypt if encrypted
			let finalData: ArrayBuffer = data;
			if (encrypted && salt && iv) {
				setStage('decrypting');
				finalData = await decryptFile(data, password, salt, iv);
			}

			// Instant browser save from memory
			const blob = new Blob([finalData]);
			triggerSave(blob);
			setStage('done');
			toast.success(encrypted ? 'decrypted & saved' : 'download complete');
		} catch (err) {
			if (encrypted) {
				toast.error('decryption failed — wrong password?');
			} else {
				toast.error(err instanceof Error ? err.message : 'download failed');
			}
			setStage('idle');
			setProgress(0);
		}
	}, [fileId, fileName, fileSize, encrypted, password, salt, iv, triggerSave]);

	const resetAndRedownload = useCallback(() => {
		setStage('idle');
		setProgress(0);
		setDownloaded(0);
		setSpeed(0);
		setEta(0);
	}, []);

	// Download in progress
	if (stage === 'downloading' || stage === 'decrypting') {
		return (
			<div className="space-y-3">
				<div className="space-y-2">
					<div className="flex justify-between text-xs font-mono">
						<span className="text-muted-foreground">
							{stage === 'decrypting' ? 'decrypting...' : 'downloading...'}
						</span>
						<span className="tabular-nums">{progress}%</span>
					</div>
					<Progress value={progress} />
					{stage === 'downloading' && (
						<div className="flex justify-between text-xs font-mono text-muted-foreground">
							<span className="tabular-nums">
								{prettyBytes(downloaded)} / {prettyBytes(fileSize)}
							</span>
							<span className="tabular-nums">
								{formatSpeed(speed)} {eta > 0 ? `· ${formatEta(eta)}` : ''}
							</span>
						</div>
					)}
				</div>
			</div>
		);
	}

	// Done — offer to save again
	if (stage === 'done') {
		return (
			<div className="space-y-3">
				<p className="text-xs font-mono text-muted-foreground">
					{encrypted ? 'file decrypted & saved' : 'file saved'}
				</p>
				<Button
					variant="outline"
					className="w-full"
					onClick={resetAndRedownload}
				>
					<Download className="h-4 w-4" />
					download again
				</Button>
			</div>
		);
	}

	// Idle — show download button (with password input for encrypted)
	return (
		<div className="space-y-3">
			{encrypted && (
				<>
					<div className="flex items-center gap-2">
						<Lock className="h-3 w-3 text-muted-foreground" />
						<p className="text-xs font-mono text-muted-foreground">this file is encrypted</p>
					</div>
					<Input
						type="password"
						placeholder="enter password to decrypt"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						onKeyDown={(e) => e.key === 'Enter' && handleDownload()}
						className="text-xs"
					/>
				</>
			)}
			<Button
				className="w-full"
				onClick={handleDownload}
				disabled={encrypted && !password}
			>
				<Download className="h-4 w-4" />
				{encrypted ? 'decrypt & download' : 'download'}
			</Button>
		</div>
	);
}
