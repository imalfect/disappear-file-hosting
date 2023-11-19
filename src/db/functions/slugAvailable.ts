'use server';
import connectDB from '@/db/connect';
import { UploadedFile} from '@/db/models/UploadedFile';

export default async function slugAvailable(slug: string): Promise<boolean> {
	await connectDB();
	const count = await UploadedFile.countDocuments({slug});
	return count === 0;
}
