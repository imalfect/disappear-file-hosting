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
			toast.error('Slug can only contain letters and numbers');
			return;
		}
		setChecking(true);
		try {
			const res = await fetch(`/api/slug-check?slug=${encodeURIComponent(trimmed)}`);
			const data = await res.json();
			if (!data.available) {
				toast.error('That slug is already taken');
				return;
			}
			slugChange(trimmed);
		} catch {
			toast.error('Failed to check slug availability');
		} finally {
			setChecking(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-sm">
				<DialogHeader>
					<DialogTitle>Custom slug</DialogTitle>
					<DialogDescription>
						Set a short, memorable slug for your upload link.
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
						{checking ? 'Checking...' : 'Set slug'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
