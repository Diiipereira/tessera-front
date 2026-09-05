import { ChevronRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { adjacentPages } from '@/lib/docs/content';
import { docsHref } from '@/lib/docs/route';
import type { DocPage } from '@/lib/docs/types';
import type { SupportedLocale } from '@/lib/locale';
import { DocsPager } from './DocsPager';
import { DocsToc } from './DocsToc';

export async function DocsArticle({
	locale,
	page,
	children
}: {
	locale: SupportedLocale;
	page: DocPage;
	children: ReactNode;
}) {
	const [t, neighbours] = await Promise.all([
		getTranslations('docs'),
		adjacentPages(locale, page.slug)
	]);

	return (
		<>
			<main className="max-w-200 min-w-0 flex-1">
				<nav
					aria-label={t('breadcrumb')}
					className="mb-4 flex min-w-0 items-center gap-1.5 text-body-sm text-text-muted"
				>
					<Link
						href={docsHref(locale, '')}
						className="no-underline hover:text-text hover:no-underline"
					>
						{t('root')}
					</Link>
					<ChevronRight className="size-3.5 shrink-0 text-text-subtle" aria-hidden="true" />
					<span>{t(`groups.${page.group}`)}</span>
					<ChevronRight className="size-3.5 shrink-0 text-text-subtle" aria-hidden="true" />
					<span className="truncate text-text">{page.title}</span>
				</nav>

				<header className="mb-8">
					<h1 className="text-h1 text-pretty text-text">{page.title}</h1>
					<p className="mt-2 text-body-lg text-pretty text-text-muted">{page.summary}</p>
				</header>

				<div className="flex flex-col gap-4">{children}</div>

				<DocsPager previous={neighbours.previous} next={neighbours.next} />
			</main>

			<aside className="sticky top-24 hidden w-52 shrink-0 xl:block">
				<DocsToc headings={page.headings} />
			</aside>
		</>
	);
}
