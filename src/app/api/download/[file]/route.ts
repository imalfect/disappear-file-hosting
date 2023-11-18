import { type NextRequest } from 'next/server';
import {isValidObjectId} from 'mongoose';
import {getUploadedFileInfoById} from '@/db/functions/getUploadedFileInfo';
import getFile from '@/s3/functions/getFile';
export async function GET(request: NextRequest) {
	// Get last URL segment
	const id = request.nextUrl.pathname.split('/').pop();
	if (!isValidObjectId(id)) {
		return new Response('Invalid ID', { status: 400 });
	}
	// Get the download info from the database
	const fileInfo = await getUploadedFileInfoById(id!);
	if (!fileInfo) {
		return new Response('File not found', { status: 404 });
	}
	const file = await getFile(fileInfo.fileKey);
	// Return the download as a stream
	// @ts-expect-error - It works fine
	return new Response(file.Body, { headers: { 'Content-Type': fileInfo.mimeType, 'Content-Disposition': `attachment; filename=${fileInfo.originalName}`} });
	// Return the download info as JSON
}