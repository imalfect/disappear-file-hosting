import {GetObjectCommand} from '@aws-sdk/client-s3';
import connectS3 from '@/s3/connect';

export default async function getFile(key: string) {
	const s3Client = await connectS3();
	console.log(`Getting file: ${key}`);
	const command = new GetObjectCommand({
		Key: key,
		Bucket: process.env.S3_BUCKET!
	});
	const response = await s3Client.send(command);
	return response;
}