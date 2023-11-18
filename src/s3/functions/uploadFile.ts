'use server';
import connectS3 from '@/s3/connect';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import {lookup} from 'mrmime';
export default async function uploadFile(name: string, fileBase64: string): Promise<string> {
	const fileExtension = name.split('.').pop();
	console.log(`New file upload: ${name} (${fileExtension})`);
	const fileToUpload = Buffer.from(fileBase64.replace(/^data:.+;base64,/, ''), 'base64');
	// Get mime from name and size from stream
	const mime = lookup(name);
	const s3Client = await connectS3();
	const objectKey = uuidv4().concat(`.${fileExtension}`);
	const command = new PutObjectCommand({
		Bucket: process.env.S3_BUCKET!,
		Key: objectKey,
		Body: fileToUpload,
		ContentType: mime!
	});
	await s3Client.send(command);
	return objectKey;
}