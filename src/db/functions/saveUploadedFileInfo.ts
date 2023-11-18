'use server';
// Importing the model type only, not the model instance
import { Document } from 'mongoose';
import { IUploadedFile,UploadedFile} from '@/db/models/UploadedFile';
import connectDB from '@/db/connect';

export default async function saveUploadedFileInfo(name: string, mime: string, size: number, fileKey: string): Promise<Document & IUploadedFile> {
	await connectDB();
	const currentTimestamp = Math.floor(Date.now() / 1000);
	console.log(`Current timestamp: ${currentTimestamp}`);
	const file = new UploadedFile({ originalName: name, mimeType: mime, uploadedAt: currentTimestamp, size, fileKey});
	const saved = await file.save();
	return saved._id.toString();
}
