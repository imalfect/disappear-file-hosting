import { db } from '@/db';
import { uploadedFiles } from '@/db/schema';

export default async function saveUploadedFileInfo(
	name: string,
	mime: string,
	size: number,
	fileKey: string,
	slug?: string,
	encryptionMeta?: { salt: string; iv: string },
): Promise<string> {
	const currentTimestamp = Math.floor(Date.now() / 1000);

	const [inserted] = await db().insert(uploadedFiles).values({
		originalName: name,
		mimeType: mime,
		size,
		fileKey,
		uploadedAt: currentTimestamp,
		slug: slug || null,
		...(encryptionMeta && {
			isEncrypted: 1,
			encryptionSalt: encryptionMeta.salt,
			encryptionIv: encryptionMeta.iv,
		}),
	}).returning({ id: uploadedFiles.id });

	return inserted.id;
}
