import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import type { SupportedLocale } from '@/lib/locale';
import enUS from '@/messages/en-US.json';
import ptBR from '@/messages/pt-BR.json';

const DICTIONARIES = { 'en-US': enUS, 'pt-BR': ptBR };

type TranslatedProps = {
	children: ReactNode;
	locale?: SupportedLocale;
};

export function Translated({ children, locale = 'en-US' }: TranslatedProps) {
	return (
		<NextIntlClientProvider locale={locale} messages={DICTIONARIES[locale]}>
			{children}
		</NextIntlClientProvider>
	);
}
