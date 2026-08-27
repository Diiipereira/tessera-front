import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { LOCALE_COOKIE, toLocale } from '@/lib/locale';
import enUS from '@/messages/en-US.json';
import ptBR from '@/messages/pt-BR.json';

const DICTIONARIES = { 'en-US': enUS, 'pt-BR': ptBR };

export default getRequestConfig(async () => {
	const store = await cookies();
	const locale = toLocale(store.get(LOCALE_COOKIE)?.value);

	return { locale, messages: DICTIONARIES[locale] };
});
