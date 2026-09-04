import matter from 'gray-matter';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ALL_DOC_SLUGS, DOC_NAV, type DocGroupId } from '@/content/docs/nav';
import type { SupportedLocale } from '@/lib/locale';
import { headingSlug } from './slug';
import type { DocNavGroup, DocNeighbours, DocPage, DocSearchEntry } from './types';

const HEADING = /^##\s+(.+?)\s*$/gm;

const KEYWORD_LIMIT = 2400;

export const fileOf = (locale: SupportedLocale, slug: string): string =>
	join(process.cwd(), 'content', 'docs', locale, slug === '' ? 'index.mdx' : `${slug}.mdx`);

const groupIdOf = (slug: string): DocGroupId =>
	DOC_NAV.find((group) => group.slugs.includes(slug))?.id ?? 'reference';

function plain(markdown: string): string {
	return markdown
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/[#`*_>|-]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.toLowerCase();
}

async function readPage(locale: SupportedLocale, slug: string): Promise<DocPage> {
	const source = await readFile(fileOf(locale, slug), 'utf8');
	const { data, content } = matter(source);
	const front = data as { title?: string; summary?: string };

	return {
		slug,
		title: front.title ?? slug,
		summary: front.summary ?? '',
		group: groupIdOf(slug),
		headings: [...content.matchAll(HEADING)].map((match) => {
			const text = match[1] ?? '';

			return { id: headingSlug(text), text };
		}),
		keywords: plain(`${front.title ?? ''} ${front.summary ?? ''} ${content}`).slice(
			0,
			KEYWORD_LIMIT
		)
	};
}

const shelves = new Map<SupportedLocale, Promise<DocPage[]>>();

export function docPages(locale: SupportedLocale): Promise<DocPage[]> {
	const known = shelves.get(locale);

	if (known !== undefined) return known;

	const reading = Promise.all(ALL_DOC_SLUGS.map((slug) => readPage(locale, slug)));

	shelves.set(locale, reading);

	return reading;
}

export async function findDocPage(
	locale: SupportedLocale,
	slug: string
): Promise<DocPage | undefined> {
	return (await docPages(locale)).find((page) => page.slug === slug);
}

export async function docNav(locale: SupportedLocale): Promise<DocNavGroup[]> {
	const pages = await docPages(locale);

	return DOC_NAV.map((group) => ({
		id: group.id,
		pages: group.slugs.flatMap((slug) => {
			const page = pages.find((entry) => entry.slug === slug);

			return page === undefined ? [] : [{ slug: page.slug, title: page.title }];
		})
	}));
}

export async function docSearchIndex(locale: SupportedLocale): Promise<DocSearchEntry[]> {
	return (await docPages(locale)).map((page) => ({
		slug: page.slug,
		title: page.title,
		group: page.group,
		summary: page.summary,
		keywords: page.keywords
	}));
}

export async function adjacentPages(locale: SupportedLocale, slug: string): Promise<DocNeighbours> {
	const pages = await docPages(locale);
	const index = pages.findIndex((page) => page.slug === slug);

	if (index === -1) return { previous: null, next: null };

	return { previous: pages[index - 1] ?? null, next: pages[index + 1] ?? null };
}
