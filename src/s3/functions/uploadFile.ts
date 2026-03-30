import connectS3 from '@/s3/connect';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { lookup } from 'mrmime';

export default async function uploadFile(name: string, file: ArrayBuffer): Promise<string> {
	const fileExtension = name.split('.').pop();
	const mime = lookup(name);
	const s3Client = await connectS3();
	const objectKey = `${uuidv4()}.${fileExtension}`;

	const command = new PutObjectCommand({
		Bucket: process.env.S3_BUCKET!,
		Key: objectKey,
		Body: Buffer.from(file),
		ContentType: mime || 'application/octet-stream',
	});

	await s3Client.send(command);
	return objectKey;
}
