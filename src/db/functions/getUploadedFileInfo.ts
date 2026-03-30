import { IUploadedFile, UploadedFile } from '@/db/models/UploadedFile';
import connectDB from '@/db/connect';
import type { Document } from 'mongoose';

export async function getUploadedFileInfoById(id: string): Promise<(Document & IUploadedFile) | null> {
	await connectDB();
	const file = await UploadedFile.findById(id);
	if (!file) return null;
	return JSON.parse(JSON.stringify(file));
}

export async function getUploadedFileInfoBySlug(slug: string): Promise<(Document & IUploadedFile) | null> {
	await connectDB();
	const file = await UploadedFile.findOne({ slug });
	if (!file) return null;
	return JSON.parse(JSON.stringify(file));
}
