import Link from 'next/link';

const serviceName = process.env.NEXT_PUBLIC_SERVICE_NAME || 'disappear';

export default function Title() {
	return (
		<Link href="/" className="group">
			<h1 className="text-2xl font-mono font-bold tracking-tight uppercase">
				<span className="text-muted-foreground mr-1">&gt;</span>
				{serviceName}
				<span className="inline-block w-2 h-5 bg-foreground ml-1 align-middle animate-pulse" />
			</h1>
		</Link>
	);
}
