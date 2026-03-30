import { type NextRequest, NextResponse } from 'next/server';
import slugAvailable from '@/db/functions/slugAvailable';
import upload from '@/upload/uploadFile';

const CAPTCHA_THRESHOLD = 100 * 1024 * 1024; // 100MB
const SIZE_LIMIT = 2 * 1024 * 1024 * 1024; // 2GB

async function verifyTurnstile(token: string): Promise<boolean> {
	const secret = process.env.TURNSTILE_SECRET_KEY;
	if (!secret) return true; // Skip if not configured

	const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ secret, response: token }),
	});

	const data = await res.json();
	return data.success === true;
}

export async function POST(request: NextRequest) {
	const slug = request.nextUrl.searchParams.get('slug') || undefined;
	const captchaToken = request.nextUrl.searchParams.get('captcha') || undefined;

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

	if (file.size > SIZE_LIMIT) {
		return NextResponse.json({ error: 'File exceeds 2GB limit' }, { status: 413 });
	}

	// Require captcha for large files
	if (file.size > CAPTCHA_THRESHOLD && process.env.TURNSTILE_SECRET_KEY) {
		if (!captchaToken) {
			return NextResponse.json({ error: 'Captcha required for files over 100MB' }, { status: 403 });
		}
		const valid = await verifyTurnstile(captchaToken);
		if (!valid) {
			return NextResponse.json({ error: 'Captcha verification failed' }, { status: 403 });
		}
	}

	const fileBody = await file.arrayBuffer();
	const uploadedId = await upload(file.name, fileBody, slug);

	return NextResponse.json({ uploadedId });
}
