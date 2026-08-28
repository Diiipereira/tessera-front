import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import type { DocNeighbours } from '@/lib/docs';
import { docsHref } from '@/lib/docs/types';

const card =
	'group flex min-w-0 flex-1 flex-col gap-1 rounded-lg border border-border bg-surface p-4 no-underline transition-colors duration-120 ease-out hover:border-border-strong hover:bg-surface-hover hover:no-underline';

export function DocsPager({ previous, next }: DocNeighbours) {
	const t = useTranslations('docs');

	if (!previous && !next) return null;

	return (
		<nav
			aria-label={t('pagination')}
			className="mt-12 flex flex-wrap gap-4 border-t border-border pt-8"
		>
			{previous ? (
				<Link href={docsHref(previous.slug)} className={card}>
					<span className="flex items-center gap-1.5 text-caption font-normal text-text-subtle">
						<ArrowLeft className="size-3.5" aria-hidden="true" />
						{t('previous')}
					</span>
					<span className="truncate text-body font-medium text-text group-hover:text-primary">
						{previous.title}
					</span>
				</Link>
			) : (
				<span className="min-w-0 flex-1" />
			)}

			{next ? (
				<Link href={docsHref(next.slug)} className={`${card} text-right`}>
					<span className="flex items-center justify-end gap-1.5 text-caption font-normal text-text-subtle">
						{t('next')}
						<ArrowRight className="size-3.5" aria-hidden="true" />
					</span>
					<span className="truncate text-body font-medium text-text group-hover:text-primary">
						{next.title}
					</span>
				</Link>
			) : (
				<span className="min-w-0 flex-1" />
			)}
		</nav>
	);
}
