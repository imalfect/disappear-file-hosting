import uploadFile from '@/s3/functions/uploadFile';
import saveUploadedFileInfo from '@/db/functions/saveUploadedFileInfo';
import {lookup} from 'mrmime';
export default async function upload(fileName: string, fileBody: ArrayBuffer): Promise<string> {
	const fileExtension = fileName.split('.').pop();
	console.log(`New file upload: ${fileName} (${fileExtension})`);
	// Get mime from name and size from stream
	const mime = lookup(fileName);
	console.log(`Mime: ${mime}`);
	console.log(`Size: ${fileBody.byteLength}`);
	console.log('Uploading to S3...');
	const fileKey = await uploadFile(fileName, fileBody);
	console.log(`Uploaded to S3 with Key: ${fileKey}`);
	const saved = await saveUploadedFileInfo(fileName, mime || 'application/octet-stream', fileBody.byteLength, fileKey);
	return saved.toString();
}