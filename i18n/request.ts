import { cookies, headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { DOCS_LOCALE_HEADER } from '@/lib/docs/route';
import { LOCALE_COOKIE, toLocale } from '@/lib/locale';
import enUS from '@/messages/en-US.json';
import ptBR from '@/messages/pt-BR.json';

const DICTIONARIES = { 'en-US': enUS, 'pt-BR': ptBR };

async function requested(): Promise<string | undefined> {
	const fromUrl = (await headers()).get(DOCS_LOCALE_HEADER);

	if (fromUrl !== null) return fromUrl;

	return (await cookies()).get(LOCALE_COOKIE)?.value;
}

export default getRequestConfig(async ({ locale: override }) => {
	const locale = toLocale(override ?? (await requested()));

	return { locale, messages: DICTIONARIES[locale] };
});
