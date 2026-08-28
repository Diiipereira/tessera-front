import { createTranslator } from 'next-intl';
import type enUS from '@/messages/en-US.json';
import type { SupportedLocale } from './locale';

type Dictionary = typeof enUS;

type MessageKey = Parameters<ReturnType<typeof createTranslator<Dictionary>>>[0];

const DICTIONARIES: Record<SupportedLocale, () => Promise<{ default: Dictionary }>> = {
	'en-US': () => import('@/messages/en-US.json'),
	'pt-BR': () => import('@/messages/pt-BR.json')
};

export async function translateIn(locale: SupportedLocale, key: MessageKey): Promise<string> {
	const { default: messages } = await DICTIONARIES[locale]();

	return createTranslator<Dictionary>({ locale, messages })(key);
}
