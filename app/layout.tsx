import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from '@/components/ui/Toaster';
import { TooltipProvider } from '@/components/ui/tooltip-provider';
import { BRAND } from '@/lib/brand';
import './globals.css';

export const metadata: Metadata = {
	title: {
		default: BRAND.name,
		template: `%s · ${BRAND.name}`
	},
	description: BRAND.tagline,
	icons: { icon: '/favicon.svg' }
};

const PRE_PAINT = `(function () {
	var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	var isDark = prefersDark;
	try {
		var stored = localStorage.getItem('tessera:theme');
		if (stored === 'light' || stored === 'dark') isDark = stored === 'dark';
	} catch (error) {
		isDark = prefersDark;
	}
	document.documentElement.classList.toggle('dark', isDark);

	try {
		if (localStorage.getItem('tessera:sidebar') === 'collapsed') {
			document.documentElement.setAttribute('data-sidebar', 'collapsed');
		}
	} catch (error) {
		void error;
	}
})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="pt-BR" suppressHydrationWarning>
			<head>
				<link
					rel="preload"
					href="/fonts/Inter-Variable.woff2"
					as="font"
					type="font/woff2"
					crossOrigin="anonymous"
				/>
				<script dangerouslySetInnerHTML={{ __html: PRE_PAINT }} />
			</head>
			<body>
				<ThemeProvider>
					<TooltipProvider delayDuration={400} disableHoverableContent>
						{children}
					</TooltipProvider>
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
