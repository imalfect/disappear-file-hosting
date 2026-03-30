'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, FileUp, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { useRateLimiter } from '@tanstack/react-pacer/rate-limiter';
import prettyBytes from 'pretty-bytes';

const RATE_LIMIT = 5;
const RATE_WINDOW = 10 * 60 * 1000;

const SIZE_LIMIT = 2 * 1024 * 1024 * 1024;
const CAPTCHA_THRESHOLD = 100 * 1024 * 1024;

interface FileUploadProps {
	onUpload: (uploadId: string) => void;
	slug?: string;
}

export default function FileUpload({ onUpload, slug }: FileUploadProps) {
	const [isDragging, setIsDragging] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [progress, setProgress] = useState(0);
	const [fileName, setFileName] = useState('');
	const [fileSize, setFileSize] = useState(0);

	const [pendingFile, setPendingFile] = useState<File | null>(null);
	const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
	const turnstileRef = useRef<TurnstileInstance>(null);

	const inputRef = useRef<HTMLInputElement>(null);
	const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

	const doUpload = useCallback((file: File, captchaToken?: string) => {
		setIsUploading(true);
		setProgress(0);
		setFileName(file.name);
		setFileSize(file.size);
		setPendingFile(null);
		setTurnstileToken(null);

		const formData = new FormData();
		formData.append('file', file);

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
				toast.success('upload complete');
				setIsUploading(false);
				setProgress(0);
				setFileName('');
				onUpload(data.uploadedId);
			} else {
				let msg = `upload failed (${xhr.status})`;
				try { msg = JSON.parse(xhr.responseText).error || msg; } catch { /* ignore */ }
				toast.error(msg);
				setIsUploading(false);
				setProgress(0);
				setFileName('');
			}
		});

		xhr.addEventListener('error', () => {
			toast.error('upload failed — network error');
			setIsUploading(false);
			setProgress(0);
			setFileName('');
		});

		const params = new URLSearchParams();
		if (slug) params.set('slug', slug);
		if (captchaToken) params.set('captcha', captchaToken);
		const qs = params.toString();
		const url = `/api/upload${qs ? `?${qs}` : ''}`;

		xhr.open('POST', url);
		xhr.send(formData);
	}, [onUpload, slug]);

	const processFile = useCallback((file: File) => {
		if (file.size > SIZE_LIMIT) {
			toast.error(`file too large — max ${prettyBytes(SIZE_LIMIT)}`);
			return;
		}

		if (file.size > CAPTCHA_THRESHOLD && siteKey) {
			setPendingFile(file);
			setTurnstileToken(null);
			turnstileRef.current?.reset();
			return;
		}

		doUpload(file);
	}, [doUpload, siteKey]);

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

	// Uploading state
	if (isUploading) {
		return (
			<div className="mt-6 w-full max-w-sm">
				<div className="border border-border p-5">
					<div className="flex items-center gap-3 mb-3">
						<FileUp className="h-4 w-4 text-muted-foreground animate-pulse" />
						<div className="min-w-0 flex-1">
							<p className="text-xs font-mono truncate">{fileName}</p>
							<p className="text-xs font-mono text-muted-foreground">{prettyBytes(fileSize)}</p>
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
	if (pendingFile && siteKey) {
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
						<p className="text-xs font-mono truncate">{pendingFile.name}</p>
						<span className="text-xs font-mono text-muted-foreground ml-auto shrink-0">{prettyBytes(pendingFile.size)}</span>
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
							onClick={() => { setPendingFile(null); setTurnstileToken(null); }}
						>
							cancel
						</Button>
						<Button
							className="flex-1"
							disabled={!turnstileToken}
							onClick={() => doUpload(pendingFile, turnstileToken!)}
						>
							upload
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
