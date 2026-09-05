export const SUPPORTED_LOCALES = ['en-US', 'pt-BR'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: SupportedLocale = 'pt-BR';

export const LOCALE_COOKIE = 'tessera-locale';

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const LOCALE_SHORT_NAMES: { locale: SupportedLocale; short: string }[] = [
	{ locale: 'pt-BR', short: 'PT-BR' },
	{ locale: 'en-US', short: 'EN' }
];

export const DOCS_SEGMENTS: Record<SupportedLocale, string> = {
	'pt-BR': 'pt',
	'en-US': 'en'
};

export function docsSegment(locale: SupportedLocale): string {
	return DOCS_SEGMENTS[locale];
}

export function localeOfDocsSegment(segment: string): SupportedLocale | undefined {
	return SUPPORTED_LOCALES.find((locale) => DOCS_SEGMENTS[locale] === segment);
}

export function isSupportedLocale(value: string): value is SupportedLocale {
	return SUPPORTED_LOCALES.some((locale) => locale === value);
}

export function toLocale(value: string | undefined): SupportedLocale {
	return value !== undefined && isSupportedLocale(value) ? value : DEFAULT_LOCALE;
}
