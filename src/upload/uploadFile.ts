import uploadFile from '@/s3/functions/uploadFile';
import saveUploadedFileInfo from '@/db/functions/saveUploadedFileInfo';
import { lookup } from 'mrmime';

export default async function upload(fileName: string, fileBody: ArrayBuffer, slug?: string): Promise<string> {
	const mime = lookup(fileName) || 'application/octet-stream';
	const fileKey = await uploadFile(fileName, fileBody);
	return saveUploadedFileInfo(fileName, mime, fileBody.byteLength, fileKey, slug);
}
