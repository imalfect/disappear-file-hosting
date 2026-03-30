import { type NextRequest, NextResponse } from 'next/server';
import slugAvailable from '@/db/functions/slugAvailable';
import upload from '@/upload/uploadFile';

export async function POST(request: NextRequest) {
	const slug = request.nextUrl.searchParams.get('slug') || undefined;

	if (slug) {
		if (!/^[A-Za-z0-9]+$/.test(slug)) {
			return NextResponse.json({ error: 'Invalid slug format' }, { status: 400 });
		}
		if (!await slugAvailable(slug)) {
			return NextResponse.json({ error: 'Slug is not available' }, { status: 400 });
		}
	}

	const data = await request.formData();
	const file = data.get('file') as File;

	if (!file) {
		return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
	}

	const fileBody = await file.arrayBuffer();
	const uploadedId = await upload(file.name, fileBody, slug);

	return NextResponse.json({ uploadedId });
}
