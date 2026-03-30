'use client';

import { useState } from 'react';
import { Lock, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { decryptFile } from '@/lib/crypto';

interface EncryptedDownloadProps {
	fileId: string;
	fileName: string;
	salt: string;
	iv: string;
}

type Stage = 'idle' | 'fetching' | 'decrypting';

export default function EncryptedDownload({ fileId, fileName, salt, iv }: EncryptedDownloadProps) {
	const [password, setPassword] = useState('');
	const [stage, setStage] = useState<Stage>('idle');

	const handleDecryptAndDownload = async () => {
		if (!password) {
			toast.error('enter the file password');
			return;
		}

		try {
			setStage('fetching');

			const res = await fetch(`/api/download/${fileId}?raw=1`);
			if (!res.ok) {
				const msg = res.status === 410 ? 'file has expired' : 'failed to fetch file';
				toast.error(msg);
				setStage('idle');
				return;
			}

			const { url } = await res.json();
			const fileRes = await fetch(url);
			if (!fileRes.ok) {
				toast.error('failed to download encrypted file');
				setStage('idle');
				return;
			}

			const encrypted = await fileRes.arrayBuffer();

			setStage('decrypting');
			const decrypted = await decryptFile(encrypted, password, salt, iv);

			const blob = new Blob([decrypted]);
			const blobUrl = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = blobUrl;
			a.download = fileName;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(blobUrl);

			toast.success('file decrypted and downloaded');
			setStage('idle');
		} catch {
			toast.error('decryption failed — wrong password?');
			setStage('idle');
		}
	};

	const busy = stage !== 'idle';

	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2">
				<Lock className="h-3 w-3 text-muted-foreground" />
				<p className="text-xs font-mono text-muted-foreground">this file is encrypted</p>
			</div>
			<Input
				type="password"
				placeholder="enter password to decrypt"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				onKeyDown={(e) => e.key === 'Enter' && !busy && handleDecryptAndDownload()}
				disabled={busy}
				className="text-xs"
			/>
			<Button
				className="w-full"
				onClick={handleDecryptAndDownload}
				disabled={busy || !password}
			>
				{busy ? (
					<>
						<Loader2 className="h-4 w-4 animate-spin" />
						{stage === 'fetching' ? 'fetching...' : 'decrypting...'}
					</>
				) : (
					<>
						<Download className="h-4 w-4" />
						decrypt & download
					</>
				)}
			</Button>
		</div>
	);
}
