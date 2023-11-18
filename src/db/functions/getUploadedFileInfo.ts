'use server';
// Importing the model type only, not the model instance
import { Document } from 'mongoose';
import {IUploadedFile,UploadedFile} from '@/db/models/UploadedFile';
import connectDB from '@/db/connect';

export async function getUploadedFileInfoById(id: string): Promise<Document & IUploadedFile> {
	await connectDB();
	const file = await UploadedFile.findById({ _id: id });
	return JSON.parse(JSON.stringify(file))!;
}

export async function getUploadedFileInfoBySlug(slug: string): Promise<Document & IUploadedFile> {
	await connectDB();
	const file = await UploadedFile.findOne({ slug });
	return JSON.parse(JSON.stringify(file))!;
}