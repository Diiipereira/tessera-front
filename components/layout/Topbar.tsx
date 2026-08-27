'use client';

import { CircleQuestionMark, Menu, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import type { RefObject } from 'react';
import { useSidebar } from '@/components/providers/sidebar-context';
import { useShortcut } from '@/lib/hooks/useShortcut';
import type { Guild } from '@/lib/types/guild';
import type { SessionUser } from '@/lib/types/session';
import { cn } from '@/lib/utils/cn';
import { Breadcrumbs } from './Breadcrumbs';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

const iconButton =
	'grid size-8 shrink-0 place-items-center rounded-md text-text-muted transition-colors duration-120 ease-out hover:bg-surface-hover hover:text-text';

type TopbarProps = {
	guild: Guild;
	user: SessionUser;
	onSearch: () => void;
	onOpenAccount: () => void;
	accountTriggerRef: RefObject<HTMLButtonElement | null>;
};

export function Topbar({ guild, user, onSearch, onOpenAccount, accountTriggerRef }: TopbarProps) {
	const t = useTranslations('shell');
	const { setMobileOpen } = useSidebar();
	const shortcut = useShortcut('K');

	return (
		<header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-bg px-4 sm:px-6">
			<button
				type="button"
				aria-label={t('openNavigation')}
				className={cn(iconButton, 'lg:hidden')}
				onClick={() => {
					setMobileOpen(true);
				}}
			>
				<Menu className="size-4" aria-hidden="true" />
			</button>

			<Breadcrumbs guild={guild} />

			<div className="flex-1" />

			<button
				type="button"
				className="hidden h-8 max-w-60 items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-body-sm text-text-muted transition-colors duration-120 ease-out hover:border-border-strong sm:flex"
				onClick={onSearch}
			>
				<Search className="size-4 shrink-0" aria-hidden="true" />
				<span className="min-w-0 flex-1 truncate text-left">{t('searchOrJump')}</span>
				<span className="rounded-sm border border-border px-1.5 font-mono text-caption font-normal whitespace-nowrap">
					{shortcut}
				</span>
			</button>

			<button
				type="button"
				aria-label={t('search')}
				className={cn(iconButton, 'sm:hidden')}
				onClick={onSearch}
			>
				<Search className="size-4" aria-hidden="true" />
			</button>

			<ThemeToggle />

			<Link href="/docs" aria-label={t('helpAndDocs')} className={cn(iconButton, 'hidden sm:grid')}>
				<CircleQuestionMark className="size-4" aria-hidden="true" />
			</Link>

			<UserMenu user={user} onOpenAccount={onOpenAccount} triggerRef={accountTriggerRef} compact />
		</header>
	);
}
