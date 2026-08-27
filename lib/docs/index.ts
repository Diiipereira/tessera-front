import { COMMANDS_PAGE } from './pages/commands';
import { GUIDE_PAGES, INTRO_PAGE } from './pages/guides';
import { MODULE_PAGES } from './pages/modules';
import type { DocBlock, DocGroup, DocPage } from './types';

function pick(pages: DocPage[], slugs: string[]): DocPage[] {
	return slugs.flatMap((slug) => pages.filter((page) => page.slug === slug));
}

export const DOC_GROUPS: DocGroup[] = [
	{
		id: 'start',
		label: 'Getting started',
		pages: [
			INTRO_PAGE,
			...pick(GUIDE_PAGES, [
				'getting-started/invite',
				'getting-started/permissions',
				'getting-started/first-module'
			])
		]
	},
	{
		id: 'concepts',
		label: 'Concepts',
		pages: pick(GUIDE_PAGES, ['concepts/config', 'concepts/plans'])
	},
	{ id: 'modules', label: 'Modules', pages: MODULE_PAGES },
	{
		id: 'reference',
		label: 'Reference',
		pages: [COMMANDS_PAGE, ...pick(GUIDE_PAGES, ['troubleshooting'])]
	}
];

export const ALL_DOC_PAGES: DocPage[] = DOC_GROUPS.flatMap((group) => group.pages);

export function findDocPage(slug: string): DocPage | null {
	return ALL_DOC_PAGES.find((page) => page.slug === slug) ?? null;
}

export function groupOf(slug: string): DocGroup | null {
	return DOC_GROUPS.find((group) => group.pages.some((page) => page.slug === slug)) ?? null;
}

export type DocNavPage = { slug: string; title: string };
export type DocNavGroup = { id: string; label: string; pages: DocNavPage[] };

export function docNav(): DocNavGroup[] {
	return DOC_GROUPS.map((group) => ({
		id: group.id,
		label: group.label,
		pages: group.pages.map((page) => ({ slug: page.slug, title: page.title }))
	}));
}

export type DocHeading = { id: string; text: string };

export function docHeadings(page: DocPage): DocHeading[] {
	return page.blocks
		.filter((block): block is Extract<DocBlock, { kind: 'heading' }> => block.kind === 'heading')
		.map((block) => ({ id: block.id, text: block.text }));
}

export type DocNeighbours = { previous: DocPage | null; next: DocPage | null };

export function adjacentPages(slug: string): DocNeighbours {
	const index = ALL_DOC_PAGES.findIndex((page) => page.slug === slug);
	if (index === -1) return { previous: null, next: null };

	return {
		previous: ALL_DOC_PAGES[index - 1] ?? null,
		next: ALL_DOC_PAGES[index + 1] ?? null
	};
}

function blockText(block: DocBlock): string {
	switch (block.kind) {
		case 'paragraph':
			return block.text;
		case 'heading':
			return block.text;
		case 'list':
			return block.items.join(' ');
		case 'steps':
			return block.items.map((step) => `${step.title} ${step.text}`).join(' ');
		case 'code':
			return block.filename ?? '';
		case 'callout':
			return `${block.title} ${block.text}`;
		case 'options':
			return block.rows.map((row) => `${row.name} ${row.text}`).join(' ');
		case 'commands':
			return block.module;
		case 'table':
			return [...block.head, ...block.rows.flat()].join(' ');
	}
}

function plain(text: string): string {
	return text
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/[`*]/g, '')
		.toLowerCase();
}

export type DocSearchEntry = {
	slug: string;
	title: string;
	group: string;
	summary: string;
	keywords: string;
};

export function docSearchIndex(): DocSearchEntry[] {
	return DOC_GROUPS.flatMap((group) =>
		group.pages.map((page) => ({
			slug: page.slug,
			title: page.title,
			group: group.label,
			summary: page.summary,
			keywords: plain([page.title, page.summary, ...page.blocks.map(blockText)].join(' ')).slice(
				0,
				2400
			)
		}))
	);
}

export function searchDocs(entries: DocSearchEntry[], query: string): DocSearchEntry[] {
	const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
	if (terms.length === 0) return [];

	return entries
		.map((entry) => {
			const title = entry.title.toLowerCase();
			let score = 0;

			for (const term of terms) {
				if (title.startsWith(term)) score += 6;
				else if (title.includes(term)) score += 4;
				else if (entry.summary.toLowerCase().includes(term)) score += 2;
				else if (entry.keywords.includes(term)) score += 1;
				else return { entry, score: -1 };
			}

			return { entry, score };
		})
		.filter((result) => result.score > 0)
		.sort((a, b) => b.score - a.score)
		.map((result) => result.entry);
}
