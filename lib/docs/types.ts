import type { DocGroupId } from '@/content/docs/nav';

export type { DocGroupId };

export type DocHeading = { id: string; text: string };

export type DocPage = {
	slug: string;
	title: string;
	summary: string;
	group: DocGroupId;
	headings: DocHeading[];
	keywords: string;
};

export type DocNavPage = { slug: string; title: string };

export type DocNavGroup = { id: DocGroupId; pages: DocNavPage[] };

export type DocSearchEntry = {
	slug: string;
	title: string;
	group: DocGroupId;
	summary: string;
	keywords: string;
};

export type DocNeighbours = { previous: DocPage | null; next: DocPage | null };

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
