'use client';

import { motion } from 'framer-motion';
import FileUpload from '@/components/FileUpload';
import SuccessDialog from '@/components/SuccessDialog';
import {useState} from 'react';
import Title from '@/components/Title';
import SlugDialog from '@/components/SlugDialog';
import toast from 'react-hot-toast';

export default function Home() {
	const [successDialogOpen, setSuccessDialogOpen] = useState(false);
	const [slugDialogOpen, setSlugDialogOpen] = useState(false);
	const [fullLink, setFullLink] = useState('');
	const [shortLink, setShortLink] = useState('');
	const [slug, setSlug] = useState('');
	const onUpload = (uploadId: string) => {
		setSuccessDialogOpen(true);
		// FIXME: set the correct links
		// FIXME: make sure text doesnt overflow
		setFullLink(`https://dspr.lol/viewfile/${uploadId}`);
		if (slug !== '') {
			setShortLink(`https://dspr.lol/${slug}`);
		}
	};
	const slugChange = (slug: string) => {
		toast.success('Slug set successfully!');
		setSlug(slug);
		setSlugDialogOpen(false);
	};
	return (
		<main className="flex min-h-screen flex-col items-center p-24">
			<motion.div
				animate={{opacity: 1}}
				initial={{opacity: 0}}
				transition={{duration:0.5}}>
				<Title/>
			</motion.div>
			<motion.div
				animate={{opacity: 1}}
				initial={{opacity: 0}}
				transition={{duration:0.5, delay: 0.3}}>
				<h2 className={'text-3xl font-bold mt-2'} onClick={() => {setSlugDialogOpen(true);}}>✨ the best temp file hosting on the internet ✨</h2>
			</motion.div>
			<motion.div
				animate={{opacity: 1}}
				initial={{opacity: 0}}
				transition={{duration:0.5, delay: 0.7}}>
				<FileUpload onUpload={onUpload} slug={slug}/>
			</motion.div>
			{/* @ts-expect-error this is fine */}
			<SuccessDialog fullLink={fullLink} shortLink={shortLink} open={successDialogOpen} onOpenChange={setSuccessDialogOpen}/>
			{/* @ts-expect-error this is fine */}
			<SlugDialog open={slugDialogOpen} onOpenChange={setSlugDialogOpen} slugChange={slugChange}/>
		</main>
	);
}
