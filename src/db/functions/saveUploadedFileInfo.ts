import { UploadedFile } from '@/db/models/UploadedFile';
import connectDB from '@/db/connect';

export default async function saveUploadedFileInfo(
	name: string,
	mime: string,
	size: number,
	fileKey: string,
	slug?: string
): Promise<string> {
	await connectDB();
	const currentTimestamp = Math.floor(Date.now() / 1000);
	const file = new UploadedFile({
		originalName: name,
		mimeType: mime,
		uploadedAt: currentTimestamp,
		size,
		fileKey,
		slug,
	});
	const saved = await file.save();
	return saved._id.toString();
}
