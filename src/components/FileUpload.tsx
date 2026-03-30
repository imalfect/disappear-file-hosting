'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, FileUp, Shield, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { useRateLimiter } from '@tanstack/react-pacer/rate-limiter';
import { encryptFile } from '@/lib/crypto';
import prettyBytes from 'pretty-bytes';

const RATE_LIMIT = 5;
const RATE_WINDOW = 10 * 60 * 1000;

const SIZE_LIMIT = 2 * 1024 * 1024 * 1024;
const CAPTCHA_THRESHOLD = 100 * 1024 * 1024;

type Stage = 'idle' | 'confirm' | 'captcha' | 'encrypting' | 'uploading';

interface FileUploadProps {
	onUpload: (uploadId: string) => void;
	slug?: string;
}

export default function FileUpload({ onUpload, slug }: FileUploadProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [stage, setStage] = useState<Stage>('idle');
	const [progress, setProgress] = useState(0);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
	const turnstileRef = useRef<TurnstileInstance>(null);

	const inputRef = useRef<HTMLInputElement>(null);
	const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

	const reset = useCallback(() => {
		setStage('idle');
		setProgress(0);
		setSelectedFile(null);
		setPassword('');
		setConfirmPassword('');
		setTurnstileToken(null);
	}, []);

	const doUpload = useCallback(async (file: File, captchaToken?: string) => {
		let fileToUpload: File | Blob = file;
		let encryptionParams = '';

		if (password) {
			setStage('encrypting');
			try {
				const { encrypted, salt, iv } = await encryptFile(file, password);
				fileToUpload = new File([encrypted], file.name, { type: 'application/octet-stream' });
				encryptionParams = `&encrypted=1&salt=${salt}&iv=${iv}`;
			} catch {
				toast.error('encryption failed');
				reset();
				return;
			}
		}

		setStage('uploading');
		setProgress(0);

		const formData = new FormData();
		formData.append('file', fileToUpload, file.name);

		const xhr = new XMLHttpRequest();

		xhr.upload.addEventListener('progress', (e) => {
			if (e.lengthComputable) {
				const pct = Math.round((e.loaded / e.total) * 100);
				setProgress(pct);
			}
		});

		xhr.addEventListener('load', () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				const data = JSON.parse(xhr.responseText);
				toast.success(password ? 'encrypted upload complete' : 'upload complete');
				reset();
				onUpload(data.uploadedId);
			} else {
				let msg = `upload failed (${xhr.status})`;
				try { msg = JSON.parse(xhr.responseText).error || msg; } catch { /* ignore */ }
				toast.error(msg);
				reset();
			}
		});

		xhr.addEventListener('error', () => {
			toast.error('upload failed — network error');
			reset();
		});

		const params = new URLSearchParams();
		if (slug) params.set('slug', slug);
		if (captchaToken) params.set('captcha', captchaToken);
		const qs = params.toString();
		const url = `/api/upload${qs ? `?${qs}` : ''}${encryptionParams}`;

		xhr.open('POST', url);
		xhr.send(formData);
	}, [onUpload, slug, password, reset]);

	const startUpload = useCallback((file: File) => {
		if (file.size > CAPTCHA_THRESHOLD && siteKey) {
			setStage('captcha');
			setTurnstileToken(null);
			turnstileRef.current?.reset();
			return;
		}
		doUpload(file);
	}, [doUpload, siteKey]);

	const processFile = useCallback((file: File) => {
		if (file.size > SIZE_LIMIT) {
			toast.error(`file too large — max ${prettyBytes(SIZE_LIMIT)}`);
			return;
		}
		setSelectedFile(file);
		setPassword('');
		setConfirmPassword('');
		setStage('confirm');
	}, []);

	const rateLimiter = useRateLimiter(processFile, {
		limit: RATE_LIMIT,
		window: RATE_WINDOW,
		onReject: () => {
			toast.error(`rate limit — max ${RATE_LIMIT} uploads per 10min`);
		},
	});

	const handleFile = useCallback((file: File) => {
		rateLimiter.maybeExecute(file);
	}, [rateLimiter]);

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files[0];
		if (file) handleFile(file);
	}, [handleFile]);

	const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) handleFile(file);
		if (inputRef.current) inputRef.current.value = '';
	}, [handleFile]);

	const handleConfirmUpload = useCallback(() => {
		if (!selectedFile) return;
		if (password && password !== confirmPassword) {
			toast.error('passwords do not match');
			return;
		}
		startUpload(selectedFile);
	}, [selectedFile, password, confirmPassword, startUpload]);

	// Encrypting state
	if (stage === 'encrypting' && selectedFile) {
		return (
			<div className="mt-6 w-full max-w-sm">
				<div className="border border-border p-5">
					<div className="flex items-center gap-3 mb-3">
						<Lock className="h-4 w-4 text-muted-foreground animate-pulse" />
						<div className="min-w-0 flex-1">
							<p className="text-xs font-mono truncate">{selectedFile.name}</p>
							<p className="text-xs font-mono text-muted-foreground">{prettyBytes(selectedFile.size)}</p>
						</div>
					</div>
					<p className="text-xs font-mono text-muted-foreground">
						encrypting...
					</p>
				</div>
			</div>
		);
	}

	// Uploading state
	if (stage === 'uploading' && selectedFile) {
		return (
			<div className="mt-6 w-full max-w-sm">
				<div className="border border-border p-5">
					<div className="flex items-center gap-3 mb-3">
						<FileUp className="h-4 w-4 text-muted-foreground animate-pulse" />
						<div className="min-w-0 flex-1">
							<p className="text-xs font-mono truncate">{selectedFile.name}</p>
							<p className="text-xs font-mono text-muted-foreground">{prettyBytes(selectedFile.size)}</p>
						</div>
						<span className="text-xs font-mono text-muted-foreground tabular-nums">{progress}%</span>
					</div>
					<Progress value={progress} />
					<p className="text-xs font-mono text-muted-foreground mt-2">
						{progress < 100 ? 'uploading...' : 'processing...'}
					</p>
				</div>
			</div>
		);
	}

	// Captcha challenge
	if (stage === 'captcha' && selectedFile && siteKey) {
		return (
			<div className="mt-6 w-full max-w-sm">
				<div className="border border-border p-5 space-y-4">
					<div className="flex items-center gap-3">
						<Shield className="h-4 w-4 text-muted-foreground" />
						<div>
							<p className="text-xs font-mono font-medium">verification required</p>
							<p className="text-xs font-mono text-muted-foreground">
								files over {prettyBytes(CAPTCHA_THRESHOLD)} need verification
							</p>
						</div>
					</div>
					<div className="flex items-center gap-3 border border-border p-3">
						<FileUp className="h-3 w-3 text-muted-foreground shrink-0" />
						<p className="text-xs font-mono truncate">{selectedFile.name}</p>
						<span className="text-xs font-mono text-muted-foreground ml-auto shrink-0">{prettyBytes(selectedFile.size)}</span>
					</div>
					<div className="flex justify-center">
						<Turnstile
							ref={turnstileRef}
							siteKey={siteKey}
							onSuccess={(token) => setTurnstileToken(token)}
							onError={() => toast.error('captcha failed')}
							onExpire={() => setTurnstileToken(null)}
							options={{ theme: 'dark' }}
						/>
					</div>
					<div className="flex gap-2">
						<Button
							variant="outline"
							className="flex-1"
							onClick={reset}
						>
							cancel
						</Button>
						<Button
							className="flex-1"
							disabled={!turnstileToken}
							onClick={() => doUpload(selectedFile, turnstileToken!)}
						>
							upload
						</Button>
					</div>
				</div>
			</div>
		);
	}

	// Confirm step (file selected, optional password)
	if (stage === 'confirm' && selectedFile) {
		return (
			<div className="mt-6 w-full max-w-sm">
				<div className="border border-border p-5 space-y-4">
					<div className="flex items-center gap-3 border border-border p-3">
						<FileUp className="h-3 w-3 text-muted-foreground shrink-0" />
						<p className="text-xs font-mono truncate">{selectedFile.name}</p>
						<span className="text-xs font-mono text-muted-foreground ml-auto shrink-0">{prettyBytes(selectedFile.size)}</span>
					</div>

					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Lock className="h-3 w-3 text-muted-foreground" />
							<p className="text-xs font-mono text-muted-foreground">encrypt with password (optional)</p>
						</div>
						<Input
							type="password"
							placeholder="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="text-xs"
						/>
						{password && (
							<Input
								type="password"
								placeholder="confirm password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								className="text-xs"
							/>
						)}
					</div>

					<div className="flex gap-2">
						<Button
							variant="outline"
							className="flex-1"
							onClick={reset}
						>
							cancel
						</Button>
						<Button
							className="flex-1"
							onClick={handleConfirmUpload}
						>
							{password ? 'encrypt & upload' : 'upload'}
						</Button>
					</div>
				</div>
			</div>
		);
	}

	// Default drop zone
	return (
		<div className="mt-6 w-full max-w-sm">
			<div
				className={`border border-dashed transition-colors cursor-pointer p-8 text-center ${
					isDragging
						? 'border-foreground/40 bg-accent'
						: 'border-border hover:border-foreground/20'
				}`}
				onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
				onDragLeave={() => setIsDragging(false)}
				onDrop={handleDrop}
				onClick={() => inputRef.current?.click()}
			>
				<input
					ref={inputRef}
					type="file"
					className="hidden"
					onChange={handleFileSelect}
				/>
				<Upload className="h-5 w-5 mx-auto mb-3 text-muted-foreground" />
				<p className="text-xs font-mono">drop file or click to browse</p>
				<p className="text-xs font-mono text-muted-foreground mt-1">
					max {prettyBytes(SIZE_LIMIT)} / expires 24h
				</p>
			</div>
		</div>
	);
}
