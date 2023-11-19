import Upload from 'rc-upload';
import {Mouse, MousePointerSquareDashed} from 'lucide-react';
import toast from 'react-hot-toast';
interface ICustomRequestParams {
	file: File;
}
interface IUploadJSON extends Response {
	uploadedId: string;
}
export default function FileUpload(props: {
	onUpload: (uploadId: string) => void;
	slug?: string;
}) {
	const customRequest = async ({ file }: ICustomRequestParams)  => {
		const formData = new FormData();
		formData.append('file', file);
		const uploadToast = toast.loading('Uploading the file...');
		const uploadedRequest = await fetch(`/api/upload?slug=${props.slug}`, {
			method: 'POST',
			body: formData
		});
		if (!uploadedRequest.ok) {
			toast.error(`Failed to upload file! Code: ${uploadedRequest.status}`, {
				id: uploadToast
			});
			return;
		}
		const uploadedJSON: IUploadJSON = await uploadedRequest.json();
		toast.success('File uploaded successfully!', {
			id: uploadToast
		});
		props.onUpload(uploadedJSON.uploadedId);
	};
	const readerProps = {
		type: 'drag',
		style: { display: 'inline-block', width: 400, height: 150 },
		className: 'border-2 border-dashed border-purple-800 rounded-lg mt-6',
		customRequest: customRequest,
	};
	return (
		<div>
			{/* @ts-expect-error different type of*/}
			<Upload {...readerProps}>
				<div className={'flex flex-col h-full items-center justify-center'}>
					<div className={'flex items-center gap-2'}>
						<MousePointerSquareDashed /><p className={'text-2xl font-bold'}>Drag and drop your files here</p>
					</div>
					<p className={'text-xl'}>or</p>
					<div className={'flex items-center gap-2'}>
						<Mouse /><p className={'text-xl font-bold'}>Click here to select your file</p>
					</div>
				</div>
			</Upload>
		</div>
	);
}
