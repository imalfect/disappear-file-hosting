import Link from 'next/link';

export default function Title() {
	return (
		<h1 className={'text-6xl font-black'}>
			<a href={'https://github.com/imalfect/disappear-file-hosting'} target={'_blank'} rel={'noreferrer'}>👻</a>
            &nbsp;
			<Link href={'/'}>disappear</Link>
		</h1>
	);
}