import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { uploadedFiles, type UploadedFile } from '@/db/schema';

export async function getUploadedFileInfoById(id: string): Promise<UploadedFile | null> {
	const [file] = await db().select().from(uploadedFiles).where(eq(uploadedFiles.id, id)).limit(1);
	return file ?? null;
}

export async function getUploadedFileInfoBySlug(slug: string): Promise<UploadedFile | null> {
	const [file] = await db().select().from(uploadedFiles).where(eq(uploadedFiles.slug, slug)).limit(1);
	return file ?? null;
}
