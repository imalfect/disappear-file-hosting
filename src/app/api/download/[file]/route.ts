import { type NextRequest, NextResponse } from 'next/server';
import { getUploadedFileInfoById } from '@/db/functions/getUploadedFileInfo';
import getPresignedUrl from '@/s3/functions/getPresignedUrl';

export async function GET(request: NextRequest) {
	const id = request.nextUrl.pathname.split('/').pop();
	const raw = request.nextUrl.searchParams.get('raw') === '1';

	if (!id) {
		return new Response('Invalid ID', { status: 400 });
	}

	const fileInfo = await getUploadedFileInfoById(id);
	if (!fileInfo) {
		return new Response('File not found', { status: 404 });
	}

	// Check expiration (24 hours)
	const expiresAt = fileInfo.uploadedAt * 1000 + 24 * 60 * 60 * 1000;
	if (Date.now() >= expiresAt) {
		return new Response('File has expired', { status: 410 });
	}

	// Generate a 1-hour presigned URL
	const presignedUrl = await getPresignedUrl(fileInfo.fileKey, fileInfo.originalName, 3600);

	// Return JSON with URL for client-side decryption, or redirect for direct download
	if (raw) {
		return NextResponse.json({ url: presignedUrl });
	}

	return Response.redirect(presignedUrl, 302);
}
