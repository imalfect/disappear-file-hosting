'use client';
import { Button } from '@/components/ui/button';
import { useReward } from 'react-rewards';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {useState} from 'react';
export default function SuccessDialog(props: {
	// eslint-disable-next-line react/require-default-props
	open: boolean;
	fullLink: string;
	onOpenChange: () => void;
	shortLink?: string;
}) {
	const { reward } = useReward('rewardId', 'confetti', {
		lifetime: 75,
		spread: 40,
		startVelocity: 15,
	});
	const [buttonText, setButtonText] = useState('Copy full link');
	const copyLink = (link: string) => {
		setButtonText('Copied!');
		navigator.clipboard.writeText(link);
		setTimeout(() => {
			setButtonText('Copy full link');
		}, 2000);
	};
	return (
		<Dialog open={props.open} onOpenChange={props.onOpenChange}>
			<DialogContent className="sm:max-w-[425px] ">
				<DialogHeader>
					<DialogTitle>Uploaded successfully 🎉</DialogTitle>
					<DialogDescription>
                        Your file has been uploaded successfully. You can access it using the link below.
					</DialogDescription>
				</DialogHeader>
				<div className="grid gap-2 py-2">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="name" className="text-left text-lg">
                            Full link
						</Label>
						<a href={props.fullLink}
							target="_blank"
							rel="noreferrer"
							className={'text-primary underline'}>
							{props.fullLink}
						</a>
					</div>
					{props.shortLink ? (
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="username" className="text-left text-lg">
								Short link
							</Label>
							<a
								href={props.shortLink}
								target="_blank"
								rel="noreferrer"
								className={'text-primary underline'}>
								{props.shortLink}
							</a>
						</div>
					) : null}
				</div>
				<DialogFooter>
					<div className={'flex flex-col text-center'}>
						<span id="rewardId"></span>
						<Button
							type="submit"
							onClick={() => {copyLink(props.fullLink);reward();}}>
							{buttonText}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
