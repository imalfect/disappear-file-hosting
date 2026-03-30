import uploadFile from '@/s3/functions/uploadFile';
import saveUploadedFileInfo from '@/db/functions/saveUploadedFileInfo';
import { lookup } from 'mrmime';

export default async function upload(
	fileName: string,
	fileBody: ArrayBuffer,
	slug?: string,
	encryptionMeta?: { salt: string; iv: string },
): Promise<string> {
	const mime = encryptionMeta
		? 'application/octet-stream'
		: lookup(fileName) || 'application/octet-stream';
	const fileKey = await uploadFile(fileName, fileBody);
	return saveUploadedFileInfo(fileName, mime, fileBody.byteLength, fileKey, slug, encryptionMeta);
}
