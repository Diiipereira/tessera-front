import { cookies } from 'next/headers';
import { LOCALE_COOKIE, toLocale, type SupportedLocale } from './locale';

export async function readLocale(): Promise<SupportedLocale> {
	const store = await cookies();

	return toLocale(store.get(LOCALE_COOKIE)?.value);
}
