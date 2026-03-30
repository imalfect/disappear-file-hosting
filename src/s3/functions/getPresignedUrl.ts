import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import connectS3 from '@/s3/connect';

export default async function getPresignedUrl(
	fileKey: string,
	originalName: string,
	expiresInSeconds = 3600
): Promise<string> {
	const s3Client = await connectS3();

	const command = new GetObjectCommand({
		Bucket: process.env.S3_BUCKET!,
		Key: fileKey,
		ResponseContentDisposition: `attachment; filename="${originalName}"`,
	});

	return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}
