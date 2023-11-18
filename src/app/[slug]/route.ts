import {NextRequest} from 'next/server';
import {getUploadedFileInfoBySlug} from '@/db/functions/getUploadedFileInfo';
import {redirect} from 'next/navigation';

export async function GET(request: NextRequest) {
	const slug = request.nextUrl.pathname.split('/').pop();
	console.log(`Handling slug: ${slug}`);
	if (!slug) {
		return new Response('Invalid slug', { status: 400 });
	}
	// Get the download info from the database
	const fileInfo = await getUploadedFileInfoBySlug(slug!);
	if (!fileInfo) {
		return new Response('File not found', { status: 404 });
	}
	// Return the download info as JSON
	redirect(`/viewfile/${fileInfo._id}`);
}