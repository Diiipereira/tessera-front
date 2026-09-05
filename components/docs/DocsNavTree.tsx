'use client';

import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import type { DocNavGroup } from '@/lib/docs';
import { docsHref } from '@/lib/docs/route';
import { toLocale } from '@/lib/locale';
import { cn } from '@/lib/utils/cn';
import { useActiveSlug } from './use-active-slug';

const item =
	'block rounded-md px-3 py-1.5 text-body no-underline transition-colors duration-120 ease-out hover:no-underline';

const states = {
	active: 'bg-primary-subtle font-medium text-primary',
	idle: 'text-text-muted hover:bg-surface-hover hover:text-text'
};

export function DocsNavTree({
	groups,
	onNavigate
}: {
	groups: DocNavGroup[];
	onNavigate?: () => void;
}) {
	const t = useTranslations('docs');
	const locale = toLocale(useLocale());
	const activeSlug = useActiveSlug();

	return (
		<nav aria-label={t('title')} className="flex flex-col gap-6">
			{groups.map((group) => (
				<div key={group.id}>
					<p className="mb-2 px-3 font-mono text-overline text-text-subtle uppercase">
						{t(`groups.${group.id}`)}
					</p>
					<ul className="flex flex-col gap-0.5">
						{group.pages.map((page) => {
							const active = page.slug === activeSlug;

							return (
								<li key={page.slug}>
									<Link
										href={docsHref(locale, page.slug)}
										aria-current={active ? 'page' : undefined}
										onClick={onNavigate}
										className={cn(item, active ? states.active : states.idle)}
									>
										{page.title}
									</Link>
								</li>
							);
						})}
					</ul>
				</div>
			))}
		</nav>
	);
}
