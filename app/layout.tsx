import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from '@/components/ui/Toaster';
import { TooltipProvider } from '@/components/ui/tooltip-provider';
import { BRAND } from '@/lib/brand';
import { siteBaseUrl } from '@/lib/site-url';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('brand');

	return {
		metadataBase: new URL(siteBaseUrl()),
		title: {
			default: BRAND.name,
			template: `%s · ${BRAND.name}`
		},
		description: t('tagline')
	};
}

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

export default async function RootLayout({ children }: { children: ReactNode }) {
	const locale = await getLocale();

	return (
		<html lang={locale} suppressHydrationWarning>
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
				<NextIntlClientProvider>
					<ThemeProvider>
						<TooltipProvider delayDuration={400} disableHoverableContent>
							{children}
						</TooltipProvider>
						<Toaster />
					</ThemeProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
