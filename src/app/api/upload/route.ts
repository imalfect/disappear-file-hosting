import {type NextRequest, NextResponse} from 'next/server';
import uploadFile from '@/s3/functions/uploadFile';
import upload from '@/upload/uploadFile';

export async function POST(request: NextRequest) {
	const data = await request.formData();
	const file = data.get('file') as File;
	console.log(JSON.stringify(file));
	const fileBody = await file.arrayBuffer();
	const uploadedId = await upload(file.name, fileBody);
	return NextResponse.json({uploadedId});
}