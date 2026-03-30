import { type NextRequest } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { getUploadedFileInfoById } from '@/db/functions/getUploadedFileInfo';
import getPresignedUrl from '@/s3/functions/getPresignedUrl';

export async function GET(request: NextRequest) {
	const id = request.nextUrl.pathname.split('/').pop();

	if (!isValidObjectId(id)) {
		return new Response('Invalid ID', { status: 400 });
	}

	const fileInfo = await getUploadedFileInfoById(id!);
	if (!fileInfo) {
		return new Response('File not found', { status: 404 });
	}

	// Check expiration (24 hours)
	const expiresAt = fileInfo.uploadedAt * 1000 + 24 * 60 * 60 * 1000;
	if (Date.now() >= expiresAt) {
		return new Response('File has expired', { status: 410 });
	}

	// Generate a 1-hour presigned URL and redirect directly to S3/R2
	const presignedUrl = await getPresignedUrl(fileInfo.fileKey, fileInfo.originalName, 3600);

	return Response.redirect(presignedUrl, 302);
}
