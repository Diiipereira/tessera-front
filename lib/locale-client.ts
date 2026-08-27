import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, toLocale } from './locale';

export function rememberLocale(value: string): void {
	const locale = toLocale(value);
	const age = String(LOCALE_COOKIE_MAX_AGE);

	document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${age}; samesite=lax`;
}
