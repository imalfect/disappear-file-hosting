import Upload from 'rc-upload';
import {Mouse, MousePointerSquareDashed} from 'lucide-react';
import uploadFile from '@/upload/uploadFile';
import toast from 'react-hot-toast';
interface ICustomRequestParams {
	file: File;
}
export default function FileUpload(props: {
	onUpload: (uploadId: string) => void;
}) {
	const customRequest = ({ file }: ICustomRequestParams)  => {
		console.log(file);
		// FileReader to read the download
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = async () => {
			const uploadToast = toast.loading('Uploading the file...');
			const base64 = reader.result;
			const uploadedId = await uploadFile(file.name, base64 as string);
			toast.success('File uploaded successfully!', {
				id: uploadToast
			});
			props.onUpload(uploadedId);
			console.log(uploadedId);
		};
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