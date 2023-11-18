'use client';

import { motion } from 'framer-motion';
import FileUpload from '@/components/FileUpload';
import SuccessDialog from '@/components/SuccessDialog';
import {useState} from 'react';
import Title from '@/components/Title';

export default function Home() {
	const [dialogOpen, setDialogOpen] = useState(false);
	const [fullLink, setFullLink] = useState('');
	const [shortLink, setShortLink] = useState('');
	const onUpload = (uploadId: string) => {
		setDialogOpen(true);
		// FIXME: set the correct links
		// FIXME: make sure text doesnt overflow
		setFullLink(`http://localhost:3000/viewfile/${uploadId}`);
		setShortLink('http://localhost:3000/cheese');
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
				<h2 className={'text-3xl font-bold mt-2'}>✨ the best temp file hosting on the internet ✨</h2>
			</motion.div>
			<motion.div
				animate={{opacity: 1}}
				initial={{opacity: 0}}
				transition={{duration:0.5, delay: 0.7}}>
				<FileUpload onUpload={onUpload}/>
			</motion.div>
			{/* @ts-expect-error this is fine */}
			<SuccessDialog fullLink={fullLink} shortLink={shortLink} open={dialogOpen} onOpenChange={setDialogOpen}/>
		</main>
	);
}
