import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import messages from '@/messages/en-US.json';

export function Translated({ children }: { children: ReactNode }) {
	return (
		<NextIntlClientProvider locale="en-US" messages={messages}>
			{children}
		</NextIntlClientProvider>
	);
}
