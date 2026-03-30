'use client';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import QRCode from 'react-qr-code';

interface SuccessDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	fullLink: string;
	shortLink?: string;
}

function displayUrl(url: string): string {
	const proto = url.indexOf('://');
	return proto > -1 ? url.slice(proto + 3) : url;
}

export default function SuccessDialog({ open, onOpenChange, fullLink, shortLink }: SuccessDialogProps) {
	const [copiedFull, setCopiedFull] = useState(false);
	const [copiedShort, setCopiedShort] = useState(false);

	const copyToClipboard = (text: string, type: 'full' | 'short') => {
		navigator.clipboard.writeText(text);
		if (type === 'full') {
			setCopiedFull(true);
			setTimeout(() => setCopiedFull(false), 2000);
		} else {
			setCopiedShort(true);
			setTimeout(() => setCopiedShort(false), 2000);
		}
	};

	const qrLink = shortLink || fullLink;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>upload complete</DialogTitle>
					<DialogDescription>
						file is live — expires in 24 hours
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-3">
					<div className="flex items-center gap-2">
						<div className="flex-1 min-w-0 border border-border bg-muted/30 px-3 py-2 text-xs font-mono truncate" title={fullLink}>
							{displayUrl(fullLink)}
						</div>
						<Button
							variant="outline"
							size="icon"
							className="shrink-0"
							onClick={() => copyToClipboard(fullLink, 'full')}
						>
							{copiedFull ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
						</Button>
						<Button variant="outline" size="icon" className="shrink-0" asChild>
							<a href={fullLink} target="_blank" rel="noreferrer">
								<ExternalLink className="h-3.5 w-3.5" />
							</a>
						</Button>
					</div>
					{shortLink && (
						<div className="flex items-center gap-2">
							<div className="flex-1 min-w-0 border border-border bg-muted/30 px-3 py-2 text-xs font-mono truncate" title={shortLink}>
								{displayUrl(shortLink)}
							</div>
							<Button
								variant="outline"
								size="icon"
								className="shrink-0"
								onClick={() => copyToClipboard(shortLink, 'short')}
							>
								{copiedShort ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
							</Button>
							<Button variant="outline" size="icon" className="shrink-0" asChild>
								<a href={shortLink} target="_blank" rel="noreferrer">
									<ExternalLink className="h-3.5 w-3.5" />
								</a>
							</Button>
						</div>
					)}

					<div className="flex justify-center py-2">
						<div className="border border-border p-3 bg-white">
							<QRCode
								value={qrLink}
								size={140}
								bgColor="#ffffff"
								fgColor="#000000"
								level="M"
							/>
						</div>
					</div>
					<p className="text-xs font-mono text-muted-foreground text-center">
						scan to open {shortLink ? 'short link' : 'file'}
					</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}
