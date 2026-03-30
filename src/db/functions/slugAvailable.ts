import { eq, count } from 'drizzle-orm';
import { db } from '@/db';
import { uploadedFiles } from '@/db/schema';

export default async function slugAvailable(slug: string): Promise<boolean> {
	const [result] = await db().select({ count: count() }).from(uploadedFiles).where(eq(uploadedFiles.slug, slug));
	return result.count === 0;
}
