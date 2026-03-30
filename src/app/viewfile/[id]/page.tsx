import { notFound } from 'next/navigation';
import { isValidObjectId } from 'mongoose';
import { getUploadedFileInfoById } from '@/db/functions/getUploadedFileInfo';
import prettyBytes from 'pretty-bytes';
import Title from '@/components/Title';
import { Button } from '@/components/ui/button';
import {
	Download,
	FileText,
	FileVideo,
	FileAudio,
	Image,
	AppWindow,
	File,
} from 'lucide-react';

function getIconForMime(mime: string) {
	const main = mime.split('/')[0];
	const cls = 'h-4 w-4 text-muted-foreground';
	switch (main) {
	case 'image': return <Image className={cls} />;
	case 'video': return <FileVideo className={cls} />;
	case 'audio': return <FileAudio className={cls} />;
	case 'text': return <FileText className={cls} />;
	case 'application': return <AppWindow className={cls} />;
	default: return <File className={cls} />;
	}
}

function timeRemaining(uploadedAt: number): string {
	const expiresAt = uploadedAt * 1000 + 24 * 60 * 60 * 1000;
	const now = Date.now();
	if (now >= expiresAt) return 'expired';
	const diff = expiresAt - now;
	const hours = Math.floor(diff / (1000 * 60 * 60));
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
	if (hours > 0) return `${hours}h ${minutes}m`;
	return `${minutes}m`;
}

export default async function ViewFilePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	if (!isValidObjectId(id)) {
		notFound();
	}

	const fileInfo = await getUploadedFileInfoById(id);
	if (!fileInfo) {
		notFound();
	}

	const uploadDate = new Date(fileInfo.uploadedAt * 1000);
	const expiryDate = new Date(fileInfo.uploadedAt * 1000 + 24 * 60 * 60 * 1000);
	const remaining = timeRemaining(fileInfo.uploadedAt);
	const isExpired = remaining === 'expired';

	return (
		<main className="flex min-h-screen flex-col items-center justify-center px-4">
			<div className="w-full max-w-sm space-y-6">
				<div className="flex justify-center">
					<Title />
				</div>

				<div className="border border-border divide-y divide-border">
					{/* File header */}
					<div className="flex items-center gap-3 p-4">
						{getIconForMime(fileInfo.mimeType)}
						<div className="min-w-0 flex-1">
							<h2 className="text-sm font-mono font-medium truncate">{fileInfo.originalName}</h2>
							<p className="text-xs font-mono text-muted-foreground">{fileInfo.mimeType}</p>
						</div>
					</div>

					{/* File details */}
					<div className="p-4 space-y-2">
						<div className="flex justify-between text-xs font-mono">
							<span className="text-muted-foreground">size</span>
							<span>{prettyBytes(fileInfo.size)}</span>
						</div>
						<div className="flex justify-between text-xs font-mono">
							<span className="text-muted-foreground">uploaded</span>
							<span>{uploadDate.toLocaleDateString()} {uploadDate.toLocaleTimeString()}</span>
						</div>
						<div className="flex justify-between text-xs font-mono">
							<span className="text-muted-foreground">expires</span>
							<span className={isExpired ? 'text-destructive' : ''}>
								{isExpired ? 'expired' : `${remaining} remaining`}
							</span>
						</div>
						<div className="flex justify-between text-xs font-mono">
							<span className="text-muted-foreground">id</span>
							<span className="truncate ml-4 text-muted-foreground">{id}</span>
						</div>
					</div>

					{/* Expiry line */}
					<div className="px-4 py-2 text-xs font-mono text-muted-foreground">
						{isExpired
							? 'this file has expired and is no longer available'
							: `expires ${expiryDate.toLocaleDateString()} at ${expiryDate.toLocaleTimeString()}`
						}
					</div>

					{/* Download */}
					{!isExpired && (
						<div className="p-4">
							<Button className="w-full" asChild>
								<a href={`/api/download/${id}`}>
									<Download className="h-4 w-4" />
									download
								</a>
							</Button>
						</div>
					)}
				</div>
			</div>
		</main>
	);
}
