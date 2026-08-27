import { describe, expect, it } from 'vitest';
import {
	adjacentPages,
	ALL_DOC_PAGES,
	DOC_GROUPS,
	docHeadings,
	docNav,
	docSearchIndex,
	findDocPage,
	groupOf,
	searchDocs
} from '@/lib/docs';
import { docsHref, type DocBlock } from '@/lib/docs/types';
import { mockModules } from '@/lib/mock';

function textOf(block: DocBlock): string[] {
	switch (block.kind) {
		case 'paragraph':
		case 'heading':
			return [block.text];
		case 'list':
			return block.items;
		case 'steps':
			return block.items.flatMap((step) => [step.title, step.text]);
		case 'callout':
			return [block.title, block.text];
		case 'options':
			return block.rows.flatMap((row) => [row.name, row.text]);
		case 'table':
			return [...block.head, ...block.rows.flat()];
		case 'code':
		case 'commands':
			return [];
	}
}

describe('documentation content', () => {
	it('gives every module its own page, so the module header link never dead-ends', () => {
		for (const entry of mockModules) {
			expect(findDocPage(`modules/${entry.id}`)).not.toBeNull();
		}
	});

	it('never repeats a slug', () => {
		const slugs = ALL_DOC_PAGES.map((page) => page.slug);
		expect(new Set(slugs).size).toBe(slugs.length);
	});

	it('keeps every group populated', () => {
		for (const group of DOC_GROUPS) {
			expect(group.pages.length).toBeGreaterThan(0);
		}
		expect(DOC_GROUPS.flatMap((group) => group.pages)).toHaveLength(ALL_DOC_PAGES.length);
	});

	it('places every page in exactly one group', () => {
		for (const page of ALL_DOC_PAGES) {
			expect(groupOf(page.slug)).not.toBeNull();
		}
	});

	it('mirrors every page into the navigation', () => {
		const navSlugs = docNav().flatMap((group) => group.pages.map((page) => page.slug));
		expect(navSlugs).toEqual(ALL_DOC_PAGES.map((page) => page.slug));
	});

	it('walks the whole set with previous and next', () => {
		const first = ALL_DOC_PAGES[0];
		const last = ALL_DOC_PAGES.at(-1);
		expect(first).toBeDefined();
		expect(last).toBeDefined();

		expect(adjacentPages(first?.slug ?? '').previous).toBeNull();
		expect(adjacentPages(last?.slug ?? '').next).toBeNull();

		for (const page of ALL_DOC_PAGES.slice(1, -1)) {
			const { previous, next } = adjacentPages(page.slug);
			expect(previous).not.toBeNull();
			expect(next).not.toBeNull();
		}
	});

	it('gives each page unique heading anchors', () => {
		for (const page of ALL_DOC_PAGES) {
			const ids = docHeadings(page).map((heading) => heading.id);
			expect(new Set(ids).size).toBe(ids.length);
		}
	});

	it('only links to documentation pages that exist', () => {
		const pattern = /\]\((\/docs[^)]*)\)/g;

		for (const page of ALL_DOC_PAGES) {
			for (const text of page.blocks.flatMap(textOf)) {
				for (const match of text.matchAll(pattern)) {
					const href = match[1] ?? '';
					const slug = href === '/docs' ? '' : href.replace(/^\/docs\//, '');
					expect(findDocPage(slug), `${page.slug} links to ${href}`).not.toBeNull();
				}
			}
		}
	});

	it('builds an href for the index and for nested pages', () => {
		expect(docsHref('')).toBe('/docs');
		expect(docsHref('modules/welcome')).toBe('/docs/modules/welcome');
	});
});

describe('documentation search', () => {
	const entries = docSearchIndex();

	it('indexes every page', () => {
		expect(entries).toHaveLength(ALL_DOC_PAGES.length);
	});

	it('returns nothing until something is typed', () => {
		expect(searchDocs(entries, '')).toHaveLength(0);
		expect(searchDocs(entries, '   ')).toHaveLength(0);
	});

	it('ranks a title match above a body match', () => {
		const results = searchDocs(entries, 'permissions');
		expect(results[0]?.slug).toBe('getting-started/permissions');
		expect(results.length).toBeGreaterThan(1);
	});

	it('finds a page by words that only appear in its body', () => {
		const results = searchDocs(entries, 'cron');
		expect(results.map((entry) => entry.slug)).toContain('modules/scheduled');
	});

	it('requires every term to match', () => {
		expect(searchDocs(entries, 'welcome zzzzz')).toHaveLength(0);
	});

	it('finds nothing for gibberish', () => {
		expect(searchDocs(entries, 'qwertyuiop')).toHaveLength(0);
	});
});
