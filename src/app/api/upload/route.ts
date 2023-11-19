import {type NextRequest, NextResponse} from 'next/server';
import slugAvailable from '@/db/functions/slugAvailable';
import upload from '@/upload/uploadFile';
export async function POST(request: NextRequest) {
	const data = await request.formData();
	// Get query parameters
	const slug = request.nextUrl.searchParams.get('slug') as string || undefined;
	// Check if slug is available
	if (slug) {
		if (!await slugAvailable(slug)) {
			return NextResponse.json({error: 'Slug is not available'}, {status: 400});
		}
	}
	const file = data.get('file') as File;
	if (!file) {
		return NextResponse.json({error: 'No file uploaded'}, {status: 400});
	}
	const fileBody = await file.arrayBuffer();
	const uploadedId = await upload(file.name, fileBody, slug);
	return NextResponse.json({uploadedId});
}
