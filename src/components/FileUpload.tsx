'use client';

import { useCallback, useRef, useState } from 'react';
import { Upload, FileUp } from 'lucide-react';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import prettyBytes from 'pretty-bytes';

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
	const inputRef = useRef<HTMLInputElement>(null);

	const uploadFile = useCallback(async (file: File) => {
		setIsUploading(true);
		setProgress(0);
		setFileName(file.name);
		setFileSize(file.size);

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
				toast.error(`Upload failed (${xhr.status})`);
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

		const url = slug ? `/api/upload?slug=${encodeURIComponent(slug)}` : '/api/upload';
		xhr.open('POST', url);
		xhr.send(formData);
	}, [onUpload, slug]);

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files[0];
		if (file) uploadFile(file);
	}, [uploadFile]);

	const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) uploadFile(file);
		if (inputRef.current) inputRef.current.value = '';
	}, [uploadFile]);

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
				<p className="text-xs text-muted-foreground mt-1">Files expire after 24 hours</p>
			</div>
		</div>
	);
}
