import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
	title: 'Disappear',
	description: 'Temporary file hosting — files vanish after 24 hours.',
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="font-sans">
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					disableTransitionOnChange
				>
					{children}
					<Toaster
						theme="dark"
						position="bottom-center"
						toastOptions={{
							className: 'font-mono text-xs',
							style: {
								background: 'hsl(0 0% 5%)',
								border: '1px solid hsl(0 0% 14%)',
								color: 'hsl(0 0% 93%)',
								borderRadius: '0px',
							},
						}}
					/>
				</ThemeProvider>
			</body>
		</html>
	);
}
