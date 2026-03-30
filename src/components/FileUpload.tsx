'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, FileUp, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { useRateLimiter } from '@tanstack/react-pacer/rate-limiter';
import prettyBytes from 'pretty-bytes';

const RATE_LIMIT = 5; // max uploads
const RATE_WINDOW = 10 * 60 * 1000; // per 10 minutes

const SIZE_LIMIT = 2 * 1024 * 1024 * 1024; // 2GB
const CAPTCHA_THRESHOLD = 100 * 1024 * 1024; // 100MB

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

	// Turnstile state for large files
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
				toast.success('File uploaded successfully!');
				setIsUploading(false);
				setProgress(0);
				setFileName('');
				onUpload(data.uploadedId);
			} else {
				let msg = `Upload failed (${xhr.status})`;
				try { msg = JSON.parse(xhr.responseText).error || msg; } catch { /* ignore */ }
				toast.error(msg);
				setIsUploading(false);
				setProgress(0);
				setFileName('');
			}
		});

		xhr.addEventListener('error', () => {
			toast.error('Upload failed — network error');
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
			toast.error(`File too large. Maximum size is ${prettyBytes(SIZE_LIMIT)}.`);
			return;
		}

		// Large files need Turnstile verification
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
			toast.error(`Rate limit reached. You can upload ${RATE_LIMIT} files every 10 minutes.`);
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
			<div className="mt-8 w-full max-w-md">
				<div className="rounded-lg border border-border bg-card p-6">
					<div className="flex items-center gap-3 mb-4">
						<FileUp className="h-5 w-5 text-muted-foreground animate-pulse" />
						<div className="min-w-0 flex-1">
							<p className="text-sm font-medium truncate">{fileName}</p>
							<p className="text-xs text-muted-foreground">{prettyBytes(fileSize)}</p>
						</div>
						<span className="text-sm font-mono text-muted-foreground">{progress}%</span>
					</div>
					<Progress value={progress} className="h-1.5" />
					<p className="text-xs text-muted-foreground mt-2">
						{progress < 100 ? 'Uploading...' : 'Processing...'}
					</p>
				</div>
			</div>
		);
	}

	// Captcha challenge for large files
	if (pendingFile && siteKey) {
		return (
			<div className="mt-8 w-full max-w-md">
				<div className="rounded-lg border border-border bg-card p-6 space-y-4">
					<div className="flex items-center gap-3">
						<Shield className="h-5 w-5 text-muted-foreground" />
						<div>
							<p className="text-sm font-medium">Verification required</p>
							<p className="text-xs text-muted-foreground">
								Files over {prettyBytes(CAPTCHA_THRESHOLD)} require a quick check
							</p>
						</div>
					</div>
					<div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
						<FileUp className="h-4 w-4 text-muted-foreground shrink-0" />
						<p className="text-sm truncate">{pendingFile.name}</p>
						<span className="text-xs text-muted-foreground ml-auto shrink-0">{prettyBytes(pendingFile.size)}</span>
					</div>
					<div className="flex justify-center">
						<Turnstile
							ref={turnstileRef}
							siteKey={siteKey}
							onSuccess={(token) => setTurnstileToken(token)}
							onError={() => toast.error('Captcha failed. Please try again.')}
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
							Cancel
						</Button>
						<Button
							className="flex-1"
							disabled={!turnstileToken}
							onClick={() => doUpload(pendingFile, turnstileToken!)}
						>
							Upload
						</Button>
					</div>
				</div>
			</div>
		);
	}

	// Default drop zone
	return (
		<div className="mt-8 w-full max-w-md">
			<div
				className={`relative rounded-lg border-2 border-dashed transition-colors cursor-pointer p-10 text-center ${
					isDragging
						? 'border-foreground/50 bg-accent'
						: 'border-border hover:border-foreground/25 hover:bg-accent/50'
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
				<Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
				<p className="text-sm font-medium">Drop a file here or click to browse</p>
				<p className="text-xs text-muted-foreground mt-1">Up to {prettyBytes(SIZE_LIMIT)} — expires after 24 hours</p>
			</div>
		</div>
	);
}
