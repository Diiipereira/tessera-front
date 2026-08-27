import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { adjacentPages, docHeadings, groupOf } from '@/lib/docs';
import type { DocPage } from '@/lib/docs/types';
import { DocBody } from './DocBody';
import { DocsPager } from './DocsPager';
import { DocsToc } from './DocsToc';

export function DocsArticle({ page }: { page: DocPage }) {
	const headings = docHeadings(page);
	const neighbours = adjacentPages(page.slug);
	const group = groupOf(page.slug);

	return (
		<>
			<main className="max-w-200 min-w-0 flex-1">
				<nav
					aria-label="Breadcrumb"
					className="mb-4 flex min-w-0 items-center gap-1.5 text-body-sm text-text-muted"
				>
					<Link href="/docs" className="no-underline hover:text-text hover:no-underline">
						Docs
					</Link>
					{group ? (
						<>
							<ChevronRight className="size-3.5 shrink-0 text-text-subtle" aria-hidden="true" />
							<span>{group.label}</span>
						</>
					) : null}
					<ChevronRight className="size-3.5 shrink-0 text-text-subtle" aria-hidden="true" />
					<span className="truncate text-text">{page.title}</span>
				</nav>

				<header className="mb-8">
					<h1 className="text-h1 text-pretty text-text">{page.title}</h1>
					<p className="mt-2 text-body-lg text-pretty text-text-muted">{page.summary}</p>
				</header>

				<DocBody blocks={page.blocks} />
				<DocsPager previous={neighbours.previous} next={neighbours.next} />
			</main>

			<aside className="sticky top-24 hidden w-52 shrink-0 xl:block">
				<DocsToc headings={headings} />
			</aside>
		</>
	);
}
