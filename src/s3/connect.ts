// noinspection ES6ConvertVarToLetConst,JSUnusedGlobalSymbols

import { S3Client } from '@aws-sdk/client-s3';

declare global {
	// eslint-disable-next-line no-var
	var s3Client: S3Client | null;
}
const S3_ENDPOINT = process.env.S3_ENDPOINT;

if (!S3_ENDPOINT || S3_ENDPOINT.length === 0) {
	throw new Error('Please add your S3 Endpoint to .env');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = global.s3Client;

if (!cached) {
	cached = null;
}

async function connectS3() {
	if (cached) {
		console.log('🚀 Using cached connection - Cloudflare R2');
		return cached;
	}
	cached = new S3Client({
		region: 'auto',
		endpoint: S3_ENDPOINT,
		forcePathStyle: true,
		credentials: {
			accessKeyId: process.env.S3_ACCESS_KEY_ID!,
			secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
		}
	});
	return cached;
}

export default connectS3;