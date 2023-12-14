import mongoose from 'mongoose';

export interface IUploadedFile extends Document {
    originalName: string;
    mimeType: string;
    size: number;
    fileKey: string;
    uploadedAt: number; // unix timestamp
    slug?: string;
}

const uploadedFileSchema = new mongoose.Schema<IUploadedFile>({
	originalName: { type: String, required: true },
	mimeType: { type: String, required: true },
	size: { type: Number, required: true },
	fileKey: { type: String, required: true },
	uploadedAt: { type: Number, required: true },
	slug: { type: String, required: false },
});
uploadedFileSchema.path('uploadedAt').index({ expires: '60' });
export const UploadedFile = mongoose.models.UploadedFile || mongoose.model<IUploadedFile>('UploadedFile', uploadedFileSchema);
