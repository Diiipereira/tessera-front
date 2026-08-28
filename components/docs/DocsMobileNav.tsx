'use client';

import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Drawer } from '@/components/ui/Drawer';
import type { DocNavGroup } from '@/lib/docs';
import { DocsNavTree } from './DocsNavTree';
import { useActiveSlug } from './use-active-slug';

export function DocsMobileNav({ groups }: { groups: DocNavGroup[] }) {
	const t = useTranslations('docs');
	const [open, setOpen] = useState(false);
	const activeSlug = useActiveSlug();

	const active = groups.flatMap((group) => group.pages).find((page) => page.slug === activeSlug);

	return (
		<>
			<button
				type="button"
				onClick={() => {
					setOpen(true);
				}}
				aria-label={active ? t('menuShowing', { page: active.title }) : t('menu')}
				className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-body text-text-muted transition-colors duration-120 ease-out hover:border-border-strong hover:text-text md:w-auto md:min-w-0 md:justify-start md:gap-2 md:px-3 lg:hidden"
			>
				<Menu className="size-4 shrink-0" aria-hidden="true" />
				<span className="hidden truncate md:block">{active?.title ?? t('title')}</span>
			</button>

			<Drawer open={open} onOpenChange={setOpen} title={t('title')}>
				<div className="min-h-0 flex-1 overflow-y-auto px-2 py-4">
					<DocsNavTree
						groups={groups}
						onNavigate={() => {
							setOpen(false);
						}}
					/>
				</div>
			</Drawer>
		</>
	);
}
