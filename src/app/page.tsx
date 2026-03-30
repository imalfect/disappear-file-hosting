'use client';

import FileUpload from '@/components/FileUpload';
import SuccessDialog from '@/components/SuccessDialog';
import SlugDialog from '@/components/SlugDialog';
import Title from '@/components/Title';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Link2 } from 'lucide-react';

export default function Home() {
	const [successDialogOpen, setSuccessDialogOpen] = useState(false);
	const [slugDialogOpen, setSlugDialogOpen] = useState(false);
	const [fullLink, setFullLink] = useState('');
	const [shortLink, setShortLink] = useState('');
	const [slug, setSlug] = useState('');

	const onUpload = (uploadId: string) => {
		const origin = window.location.origin;
		setFullLink(`${origin}/viewfile/${uploadId}`);
		if (slug) {
			setShortLink(`${origin}/${slug}`);
		} else {
			setShortLink('');
		}
		setSuccessDialogOpen(true);
	};

	const handleSlugChange = (newSlug: string) => {
		toast.success(`Slug set to "${newSlug}"`);
		setSlug(newSlug);
		setSlugDialogOpen(false);
	};

	return (
		<main className="flex min-h-screen flex-col items-center justify-center px-4">
			<div className="flex flex-col items-center gap-2 mb-2">
				<Title />
				<p className="text-sm text-muted-foreground">
					Temporary file hosting — files vanish after 24 hours
				</p>
			</div>

			<FileUpload onUpload={onUpload} slug={slug} />

			<div className="mt-4">
				<Button
					variant="ghost"
					size="sm"
					className="text-xs text-muted-foreground"
					onClick={() => setSlugDialogOpen(true)}
				>
					<Link2 className="h-3 w-3 mr-1" />
					{slug ? `Slug: ${slug}` : 'Set custom slug'}
				</Button>
			</div>

			<SuccessDialog
				fullLink={fullLink}
				shortLink={shortLink}
				open={successDialogOpen}
				onOpenChange={setSuccessDialogOpen}
			/>
			<SlugDialog
				open={slugDialogOpen}
				onOpenChange={setSlugDialogOpen}
				slugChange={handleSlugChange}
			/>
		</main>
	);
}
