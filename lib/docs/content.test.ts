import { existsSync, readdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ALL_DOC_SLUGS, DOC_NAV } from '@/content/docs/nav';
import { SUPPORTED_LOCALES } from '@/lib/locale';
import { MODULE_IDS } from '@/lib/types/modules';
import { docNav, docPages, fileOf, findDocPage } from './content';

const MODULE_PREFIX = 'modules/';

describe('documentation content', () => {
	it('has every page in every language, so no reader falls back to the other one', () => {
		const missing = SUPPORTED_LOCALES.flatMap((locale) =>
			ALL_DOC_SLUGS.filter((slug) => !existsSync(fileOf(locale, slug))).map(
				(slug) => `${locale}: ${slug}`
			)
		);

		expect(missing).toEqual([]);
	});

	it('gives every page a title and a summary in both languages', async () => {
		for (const locale of SUPPORTED_LOCALES) {
			const pages = await docPages(locale);
			const bare = pages.filter((page) => page.title === page.slug || page.summary === '');

			expect(bare.map((page) => `${locale}: ${page.slug}`)).toEqual([]);
		}
	});

	it('writes the two languages apart, never the same text twice', async () => {
		const [english, portuguese] = await Promise.all([docPages('en-US'), docPages('pt-BR')]);
		const shared = english.filter(
			(page) => portuguese.find((other) => other.slug === page.slug)?.title === page.title
		);

		expect(shared.map((page) => page.slug)).toEqual(['modules/automod', 'modules/tickets']);
	});

	it('documents every module the dashboard can open', () => {
		const documented = ALL_DOC_SLUGS.filter((slug) => slug.startsWith(MODULE_PREFIX)).map((slug) =>
			slug.slice(MODULE_PREFIX.length)
		);

		expect(MODULE_IDS.filter((id) => !documented.includes(id))).toEqual(['custom-commands']);
	});

	it('documents nothing the dashboard does not have a screen for', () => {
		const documented = ALL_DOC_SLUGS.filter((slug) => slug.startsWith(MODULE_PREFIX)).map((slug) =>
			slug.slice(MODULE_PREFIX.length)
		);

		expect(documented.filter((id) => !MODULE_IDS.some((known) => known === id))).toEqual([]);
	});

	it('reads the headings out of the page, so the contents list matches what is on it', async () => {
		const page = await findDocPage('en-US', 'modules/welcome');

		expect(page?.headings.map((heading) => heading.id)).toContain('variables');
	});

	it('keeps the nav in the order the manifest declares', async () => {
		const nav = await docNav('pt-BR');

		expect(nav.map((group) => group.id)).toEqual(DOC_NAV.map((group) => group.id));
		expect(nav[0]?.pages[0]?.slug).toBe('');
	});

	it('leaves no MDX file out of the nav, because an orphan page cannot be reached', () => {
		const declared = new Set(ALL_DOC_SLUGS);

		const orphans = SUPPORTED_LOCALES.flatMap((locale) => {
			const root = dirname(fileOf(locale, 'x'));

			return readdirSync(root, { recursive: true })
				.map((entry) => String(entry).replaceAll('\\', '/'))
				.filter((entry) => entry.endsWith('.mdx'))
				.map((entry) => entry.replace(/\.mdx$/, '').replace(/^index$/, ''))
				.filter((slug) => !declared.has(slug))
				.map((slug) => `${locale}: ${slug}`);
		});

		expect(orphans).toEqual([]);
	});
});
