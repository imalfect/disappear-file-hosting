import Link from 'next/link';
import { Ghost } from 'lucide-react';

export default function Title() {
	return (
		<Link href="/" className="flex items-center gap-2 group">
			<Ghost className="h-8 w-8 text-foreground transition-transform group-hover:scale-110" />
			<h1 className="text-3xl font-bold tracking-tight">disappear</h1>
		</Link>
	);
}
