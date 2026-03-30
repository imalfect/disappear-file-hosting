import { db } from '@/db';
import { uploadedFiles } from '@/db/schema';

export default async function saveUploadedFileInfo(
	name: string,
	mime: string,
	size: number,
	fileKey: string,
	slug?: string
): Promise<string> {
	const currentTimestamp = Math.floor(Date.now() / 1000);

	const [inserted] = await db().insert(uploadedFiles).values({
		originalName: name,
		mimeType: mime,
		size,
		fileKey,
		uploadedAt: currentTimestamp,
		slug: slug || null,
	}).returning({ id: uploadedFiles.id });

	return inserted.id;
}
