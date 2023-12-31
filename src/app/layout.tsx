import type { Metadata } from 'next';
import {Nunito} from 'next/font/google';
import './globals.css';
import {ThemeProvider} from '@/components/theme-provider';
import {Toaster} from 'react-hot-toast';

const nunito = Nunito({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Disappear',
	description: 'Disappear is a temporary file hosting.',
};

export default function RootLayout({
	children,
}: {
  children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body className={nunito.className}>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					themes={['light', 'dark', 'system']}>
					{children}
					<Toaster
						position={'bottom-center'}
						toastOptions={{
							className: 'border-2 border-purple-800',
							style: {
								backgroundColor: '#020817',
								color: '#fff',
								fontWeight: 'bold',
								borderRadius: 30
							}
						}}
					/>
				</ThemeProvider>
			</body>
		</html>
	);
}
