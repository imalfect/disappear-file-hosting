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
	Clock,
	HardDrive,
	Tag,
	Timer,
} from 'lucide-react';

function getIconForMime(mime: string) {
	const main = mime.split('/')[0];
	const cls = 'h-6 w-6 text-muted-foreground';
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
	if (now >= expiresAt) return 'Expired';
	const diff = expiresAt - now;
	const hours = Math.floor(diff / (1000 * 60 * 60));
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
	if (hours > 0) return `${hours}h ${minutes}m remaining`;
	return `${minutes}m remaining`;
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
	const isExpired = remaining === 'Expired';

	return (
		<main className="flex min-h-screen flex-col items-center justify-center px-4">
			<div className="w-full max-w-md space-y-6">
				<div className="flex justify-center">
					<Title />
				</div>

				<div className="rounded-lg border bg-card p-6 space-y-4">
					<div className="flex items-center gap-3">
						{getIconForMime(fileInfo.mimeType)}
						<div className="min-w-0 flex-1">
							<h2 className="text-lg font-semibold truncate">{fileInfo.originalName}</h2>
							<p className="text-xs text-muted-foreground">{fileInfo.mimeType}</p>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3 text-sm">
						<div className="flex items-center gap-2 text-muted-foreground">
							<HardDrive className="h-4 w-4 shrink-0" />
							<span>{prettyBytes(fileInfo.size)}</span>
						</div>
						<div className="flex items-center gap-2 text-muted-foreground">
							<Tag className="h-4 w-4 shrink-0" />
							<span className="truncate font-mono text-xs">{id}</span>
						</div>
						<div className="flex items-center gap-2 text-muted-foreground">
							<Clock className="h-4 w-4 shrink-0" />
							<span>{uploadDate.toLocaleDateString()}, {uploadDate.toLocaleTimeString()}</span>
						</div>
						<div className="flex items-center gap-2 text-muted-foreground">
							<Timer className="h-4 w-4 shrink-0" />
							<span className={isExpired ? 'text-destructive' : ''}>{remaining}</span>
						</div>
					</div>

					<div className="pt-2 text-xs text-muted-foreground text-center">
						Expires {expiryDate.toLocaleDateString()} at {expiryDate.toLocaleTimeString()}
					</div>

					{!isExpired && (
						<Button className="w-full" asChild>
							<a href={`/api/download/${id}`}>
								<Download className="h-4 w-4 mr-2" />
								Download
							</a>
						</Button>
					)}

					{isExpired && (
						<div className="text-center text-sm text-destructive font-medium">
							This file has expired and is no longer available.
						</div>
					)}
				</div>
			</div>
		</main>
	);
}
