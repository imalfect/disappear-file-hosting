import { type NextRequest } from 'next/server';
import { getUploadedFileInfoBySlug } from '@/db/functions/getUploadedFileInfo';
import { redirect } from 'next/navigation';

export async function GET(request: NextRequest) {
	const slug = request.nextUrl.pathname.split('/').pop();

	if (!slug) {
		return new Response('Invalid slug', { status: 400 });
	}

	const fileInfo = await getUploadedFileInfoBySlug(slug);
	if (!fileInfo) {
		return new Response('File not found', { status: 404 });
	}

	redirect(`/viewfile/${fileInfo.id}`);
}
