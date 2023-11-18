'use client';
import {Button} from '@/components/ui/button';
import {AppWindow, CaseSensitive, File, FileAudio, FileText, FileVideo, Image} from 'lucide-react';
import React, {useEffect, useState} from 'react';
import {getUploadedFileInfoById} from '@/db/functions/getUploadedFileInfo';
import toast from 'react-hot-toast';
import prettyBytes from 'pretty-bytes';
import Title from '@/components/Title';
export default function ViewFilePage({ params }: { params: { id: string } }) {
	const [fileInfo, setFileInfo] = useState({
		originalName: '',
		size: 0,
		type: '',
		uploadedAt: 0,
		id: '',
	});
	useEffect(() => {
		async function e() {
			console.log(params);
			// Get download info
			const fileInfo = await getUploadedFileInfoById(params.id);
			if (!fileInfo) {
				toast.error('File not found');
				return;
			}
			console.log(fileInfo);
			setFileInfo({
				originalName: fileInfo.originalName,
				size: fileInfo.size,
				type: fileInfo.mimeType,
				uploadedAt: fileInfo.uploadedAt,
				id: fileInfo.id,
			});
		}
		// noinspection JSIgnoredPromiseFromCall
		e();
	}, [params]);
	return (
		<main className="flex min-h-screen flex-col items-center p-24">
			<Title/>
			<div className={'flex gap-3 items-center mt-2'}>
				{/* Disabling eslint because it's not an image but rather an icon */}
				{/* eslint-disable-next-line jsx-a11y/alt-text */}
				{getIconForMime(fileInfo.type)}
				<h2 className={'text-4xl font-bold mt-2 underline underline-offset-3 decoration-purple-700'}>{fileInfo.originalName}</h2>
			</div>
			<h3 className={'text-2xl font-bold mt-2'}>File Information</h3>
			<div className={'flex flex-col gap-2 font text-center'}>
				<p>Size:&nbsp;
					<span className={'text-purple-600 font-bold'}>
						{prettyBytes(fileInfo.size)}
					</span>
				</p>
				<p>Type:&nbsp;
					<span className={'text-purple-600 font-bold'}>
						{fileInfo.type}
					</span>
				</p>
				<p>Uploaded on&nbsp;
					<span className={'text-purple-600 font-bold'}>
						{new Date(fileInfo.uploadedAt * 1000).toLocaleString()}
					</span>
				</p>
				<p>Expires:&nbsp;
					<span className={'text-purple-600 font-bold'}>
						{new Date(fileInfo.uploadedAt * 1000 + 1000 * 60 * 60 * 24).toLocaleString()}
					</span>
				</p>
				<p>Unique ID:&nbsp;
					<span className={'text-purple-600 font-bold'}>
						{params.id}
					</span>
				</p>
			</div>
			<Button className={'mt-4'} onClick={() => {
				toast('Downloading started!', {
					icon: '📥',
				});
				window.location.href = `/api/download/${params.id}`;
			}}>Download</Button>
		</main>
	);
}

function getIconForMime(mime: string): React.ReactNode {
	// Get the first part of mime type
	const mimeMain = mime.split('/')[0];
	// Return icons (from lucide-icons) based on a mime type (return JSX)
	switch (mimeMain) {
	case 'image':
		// eslint-disable-next-line jsx-a11y/alt-text
		return <Image size={40} className={'text-purple-700'}/>;
	case 'video':
		return <FileVideo size={40} className={'text-purple-700'}/>;
	case 'audio':
		return <FileAudio size={40} className={'text-purple-700'}/>;
	case 'text':
		return <FileText size={40} className={'text-purple-700'}/>;
	case 'application':
		return <AppWindow size={40} className={'text-purple-700'}/>;
	case 'font':
		return <CaseSensitive size={40} className={'text-purple-700'}/>;
	default:
		return <File size={40} className={'text-purple-700'}/>;
	}
}