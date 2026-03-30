import { type NextRequest, NextResponse } from 'next/server';
import slugAvailable from '@/db/functions/slugAvailable';

export async function GET(request: NextRequest) {
	const slug = request.nextUrl.searchParams.get('slug');

	if (!slug || !/^[A-Za-z0-9]+$/.test(slug)) {
		return NextResponse.json({ available: false, error: 'Invalid slug' }, { status: 400 });
	}

	const available = await slugAvailable(slug);
	return NextResponse.json({ available });
}
