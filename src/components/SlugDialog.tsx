'use client';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { toast } from 'sonner';

interface SlugDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	slugChange: (slug: string) => void;
}

export default function SlugDialog({ open, onOpenChange, slugChange }: SlugDialogProps) {
	const [slug, setSlug] = useState('');
	const [checking, setChecking] = useState(false);

	const handleSubmit = async () => {
		const trimmed = slug.trim();
		if (!/^[A-Za-z0-9]+$/.test(trimmed)) {
			toast.error('alphanumeric only');
			return;
		}
		setChecking(true);
		try {
			const res = await fetch(`/api/slug-check?slug=${encodeURIComponent(trimmed)}`);
			const data = await res.json();
			if (!data.available) {
				toast.error('slug taken');
				return;
			}
			slugChange(trimmed);
		} catch {
			toast.error('check failed');
		} finally {
			setChecking(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>custom slug</DialogTitle>
					<DialogDescription>
						set a short slug for a memorable link
					</DialogDescription>
				</DialogHeader>
				<Input
					placeholder="my-file"
					value={slug}
					onChange={(e) => setSlug(e.target.value)}
					onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
				/>
				<DialogFooter>
					<Button onClick={handleSubmit} disabled={checking || !slug.trim()}>
						{checking ? 'checking...' : 'set slug'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
