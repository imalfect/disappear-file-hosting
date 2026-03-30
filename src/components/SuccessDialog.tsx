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

interface SuccessDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	fullLink: string;
	shortLink?: string;
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

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Upload complete</DialogTitle>
					<DialogDescription>
						Your file is live and will expire in 24 hours.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-3">
					<div className="flex items-center gap-2">
						<div className="flex-1 rounded-md border bg-muted/50 px-3 py-2 text-sm font-mono truncate">
							{fullLink}
						</div>
						<Button
							variant="outline"
							size="icon"
							onClick={() => copyToClipboard(fullLink, 'full')}
						>
							{copiedFull ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
						</Button>
						<Button variant="outline" size="icon" asChild>
							<a href={fullLink} target="_blank" rel="noreferrer">
								<ExternalLink className="h-4 w-4" />
							</a>
						</Button>
					</div>
					{shortLink && (
						<div className="flex items-center gap-2">
							<div className="flex-1 rounded-md border bg-muted/50 px-3 py-2 text-sm font-mono truncate">
								{shortLink}
							</div>
							<Button
								variant="outline"
								size="icon"
								onClick={() => copyToClipboard(shortLink, 'short')}
							>
								{copiedShort ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
							</Button>
							<Button variant="outline" size="icon" asChild>
								<a href={shortLink} target="_blank" rel="noreferrer">
									<ExternalLink className="h-4 w-4" />
								</a>
							</Button>
						</div>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
