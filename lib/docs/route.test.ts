import { describe, expect, it } from 'vitest';
import { ALL_DOC_SLUGS } from '@/content/docs/nav';
import { DOCS_SEGMENTS, SUPPORTED_LOCALES } from '@/lib/locale';
import { docsAlternates, docsHref, neutralDocsHref, readDocsPath, sameDocsPageIn } from './route';

describe('documentation routing', () => {
	it('reads the language out of the path, so the page never asks the cookie', () => {
		expect(readDocsPath('/docs/en/modules/welcome')).toEqual({
			kind: 'localized',
			locale: 'en-US',
			slug: 'modules/welcome'
		});

		expect(readDocsPath('/docs/pt')).toEqual({ kind: 'localized', locale: 'pt-BR', slug: '' });
	});

	it('keeps the slug of a path with no language, so the redirect lands on the same page', () => {
		expect(readDocsPath('/docs/modules/welcome')).toEqual({
			kind: 'unprefixed',
			slug: 'modules/welcome'
		});

		expect(readDocsPath('/docs')).toEqual({ kind: 'unprefixed', slug: '' });
		expect(readDocsPath('/docs/')).toEqual({ kind: 'unprefixed', slug: '' });
	});

	it('leaves every other path alone', () => {
		expect(readDocsPath('/pricing').kind).toBe('outside');
		expect(readDocsPath('/docsearch').kind).toBe('outside');
		expect(readDocsPath('/servers/1/modules/welcome').kind).toBe('outside');
	});

	it('gives every language a segment of its own', () => {
		const segments = SUPPORTED_LOCALES.map((locale) => DOCS_SEGMENTS[locale]);

		expect(new Set(segments).size).toBe(SUPPORTED_LOCALES.length);
	});

	it('never lets a page slug look like a language, because the first segment decides', () => {
		const segments = SUPPORTED_LOCALES.map((locale) => DOCS_SEGMENTS[locale]);
		const shadowed = ALL_DOC_SLUGS.filter((slug) => segments.includes(slug.split('/')[0] ?? ''));

		expect(shadowed).toEqual([]);
	});

	it('switches a reader to the same page in the other language', () => {
		expect(sameDocsPageIn('/docs/pt/modules/welcome', 'en-US')).toBe('/docs/en/modules/welcome');
		expect(sameDocsPageIn('/docs/en', 'pt-BR')).toBe('/docs/pt');
		expect(sameDocsPageIn('/docs/commands', 'en-US')).toBe('/docs/en/commands');
	});

	it('has nothing to switch outside the documentation', () => {
		expect(sameDocsPageIn('/servers/1/settings', 'en-US')).toBeUndefined();
	});

	it('answers each language with itself and every other, or Google ignores the tags', () => {
		const { canonical, languages } = docsAlternates('en-US', 'commands');

		expect(canonical).toBe('/docs/en/commands');
		expect(languages).toEqual({
			'en-US': '/docs/en/commands',
			'pt-BR': '/docs/pt/commands',
			'x-default': '/docs/commands'
		});
	});

	it('points x-default at the path that picks a language for whoever has no preference', () => {
		expect(neutralDocsHref('')).toBe('/docs');
		expect(neutralDocsHref('commands')).toBe('/docs/commands');
	});

	it('builds a path the router can read back', () => {
		for (const locale of SUPPORTED_LOCALES) {
			for (const slug of ALL_DOC_SLUGS) {
				expect(readDocsPath(docsHref(locale, slug))).toEqual({ kind: 'localized', locale, slug });
			}
		}
	});
});
