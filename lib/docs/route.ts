import {
	docsSegment,
	localeOfDocsSegment,
	SUPPORTED_LOCALES,
	type SupportedLocale
} from '@/lib/locale';

export const DOCS_LOCALE_HEADER = 'x-tessera-docs-locale';

const ROOT = '/docs';

export type DocsPath = typeof ROOT | `${typeof ROOT}/${string}`;

export type DocsRoute =
	| { kind: 'localized'; locale: SupportedLocale; slug: string }
	| { kind: 'unprefixed'; slug: string }
	| { kind: 'outside' };

function partsOf(pathname: string): string[] | undefined {
	if (pathname === ROOT) return [];
	if (!pathname.startsWith(`${ROOT}/`)) return undefined;

	return pathname
		.slice(ROOT.length + 1)
		.split('/')
		.filter((part) => part !== '');
}

export function readDocsPath(pathname: string): DocsRoute {
	const parts = partsOf(pathname);

	if (parts === undefined) return { kind: 'outside' };

	const locale = localeOfDocsSegment(parts[0] ?? '');

	return locale === undefined
		? { kind: 'unprefixed', slug: parts.join('/') }
		: { kind: 'localized', locale, slug: parts.slice(1).join('/') };
}

export function docsHref(locale: SupportedLocale, slug: string): DocsPath {
	const segment = docsSegment(locale);

	return slug === '' ? `${ROOT}/${segment}` : `${ROOT}/${segment}/${slug}`;
}

export function neutralDocsHref(slug: string): DocsPath {
	return slug === '' ? ROOT : `${ROOT}/${slug}`;
}

export function sameDocsPageIn(pathname: string, locale: SupportedLocale): DocsPath | undefined {
	const route = readDocsPath(pathname);

	return route.kind === 'outside' ? undefined : docsHref(locale, route.slug);
}

export function docsAlternates(
	locale: SupportedLocale,
	slug: string
): { canonical: DocsPath; languages: Record<SupportedLocale | 'x-default', DocsPath> } {
	return {
		canonical: docsHref(locale, slug),
		languages: {
			'pt-BR': docsHref('pt-BR', slug),
			'en-US': docsHref('en-US', slug),
			'x-default': neutralDocsHref(slug)
		}
	};
}

export const docsLocaleParams = (): { locale: string }[] =>
	SUPPORTED_LOCALES.map((locale) => ({ locale: docsSegment(locale) }));
