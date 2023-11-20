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
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import slugAvailable from '@/db/functions/slugAvailable';
import toast from 'react-hot-toast';
export default function SlugDialog(props: {
	// eslint-disable-next-line react/require-default-props
	open: boolean;
	onOpenChange: () => void;
	slugChange: (slug: string) => void;
}) {
	const [slug, setSlug] = useState('');
	return (
		<Dialog open={props.open} onOpenChange={props.onOpenChange}>
			<DialogContent className="sm:max-w-[425px] ">
				<DialogHeader>
					<DialogTitle>Set upload slug</DialogTitle>
					<DialogDescription>
						Use the text field below to set a custom slug for your upload. This will make your temp upload link shorter and easier to remember.
					</DialogDescription>
				</DialogHeader>
				<div>
					<Input
						id="slug"
						name="slug"
						type="text"
						placeholder="Slug"
						className="border-2 border-dashed border-purple-800 rounded-lg"
						onChange={(e) => setSlug(e.target.value)}
					/>
				</div>
				<DialogFooter>
					<div className={'flex flex-col text-center'}>
						<span id="rewardId"></span>
						<Button
							type="submit"
							onClick={async () => {
								const regex = /^[A-Za-z0-9]+$/;
								if (!regex.test(slug)) {
									toast.error('Slug cannot contain special characters!');
									return;
								}
								const isSlugAvailable = await slugAvailable(slug);
								if (!isSlugAvailable) {
									toast.error('Slug is not available!');
									return;
								}
								props.slugChange(slug);
							}}>
							Set slug
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
