'use server';
import {ListBucketsCommand} from '@aws-sdk/client-s3';
import connectS3 from '@/s3/connect';

export default async function listAllBuckets() {
	const s3Client = await connectS3();
	const command = new ListBucketsCommand({});
	const response = await s3Client.send(command);
	console.log(response);
	return response.Buckets;
}