'use server';
import uploadFile from '@/s3/functions/uploadFile';
import saveUploadedFileInfo from '@/db/functions/saveUploadedFileInfo';
import {lookup} from 'mrmime';

export default async function upload(name: string, fileBase64: string): Promise<string> {
	const fileExtension = name.split('.').pop();
	console.log(`New file upload: ${name} (${fileExtension})`);
	const fileToUpload = Buffer.from(fileBase64.replace(/^data:.+;base64,/, ''), 'base64');
	// Get mime from name and size from stream
	const mime = lookup(name);
	console.log(`Mime: ${mime}`);
	console.log(`Size: ${fileToUpload.length}`);
	console.log('Uploading to S3...');
	const s3ETag = await uploadFile(name, fileBase64);
	console.log(`Uploaded to S3 with ETag: ${s3ETag}`);
	const pureETag = s3ETag.replace(/"/g, '');
	const saved = await saveUploadedFileInfo(name, mime || 'application/octet-stream', fileToUpload.length, pureETag);
	return saved.toString();
}