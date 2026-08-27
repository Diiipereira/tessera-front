import type { ModuleId } from '@/lib/types/modules';

export type DocCalloutTone = 'info' | 'success' | 'warning' | 'danger';

export type DocOption = {
	name: string;
	type: string;
	fallback: string;
	text: string;
};

export type DocStep = {
	title: string;
	text: string;
};

export type DocBlock =
	| { kind: 'paragraph'; text: string }
	| { kind: 'heading'; id: string; text: string }
	| { kind: 'list'; ordered?: boolean; items: string[] }
	| { kind: 'steps'; items: DocStep[] }
	| { kind: 'code'; language: string; filename?: string; code: string }
	| { kind: 'callout'; tone: DocCalloutTone; title: string; text: string }
	| { kind: 'options'; rows: DocOption[] }
	| { kind: 'commands'; module: ModuleId }
	| { kind: 'table'; head: string[]; rows: string[][] };

export type DocPage = {
	slug: string;
	title: string;
	summary: string;
	blocks: DocBlock[];
};

export type DocGroup = {
	id: string;
	label: string;
	pages: DocPage[];
};

export type DocsHref = '/docs' | `/docs/${string}`;

export function docsHref(slug: string): DocsHref {
	return slug === '' ? '/docs' : `/docs/${slug}`;
}
