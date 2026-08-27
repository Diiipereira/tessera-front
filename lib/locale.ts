export const SUPPORTED_LOCALES = ['en-US', 'pt-BR'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'pt-BR';

export const LOCALE_COOKIE = 'tessera-locale';

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isSupportedLocale(value: string): value is SupportedLocale {
	return SUPPORTED_LOCALES.some((locale) => locale === value);
}

export function toLocale(value: string | undefined): SupportedLocale {
	return value !== undefined && isSupportedLocale(value) ? value : DEFAULT_LOCALE;
}
