import { S3Client } from '@aws-sdk/client-s3';

declare global {
	// eslint-disable-next-line no-var
	var s3Client: S3Client | null;
}

let cached = global.s3Client || null;

async function connectS3() {
	if (cached) {
		return cached;
	}

	const endpoint = process.env.S3_ENDPOINT;
	if (!endpoint) {
		throw new Error('Please add your S3 Endpoint to .env');
	}

	cached = new S3Client({
		region: 'auto',
		endpoint,
		forcePathStyle: true,
		credentials: {
			accessKeyId: process.env.S3_ACCESS_KEY_ID!,
			secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
		},
	});

	global.s3Client = cached;
	return cached;
}

export default connectS3;
