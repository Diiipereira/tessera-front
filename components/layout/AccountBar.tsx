'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { BrandMark } from '@/components/auth/BrandMark';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { UserMenu } from '@/components/layout/UserMenu';
import { Button } from '@/components/ui/Button';
import { BRAND } from '@/lib/brand';
import type { SessionUser } from '@/lib/types/session';

const navLink =
	'rounded-md px-2.5 py-1.5 text-body font-medium text-text-muted no-underline transition-colors duration-120 ease-out hover:bg-surface-hover hover:text-text hover:no-underline';

export function AccountBar({ user }: { user: SessionUser | null }) {
	const t = useTranslations('shell');

	return (
		<header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-bg px-6 sm:px-8">
			<Link href="/" className="flex items-center gap-2.5">
				<BrandMark size="sm" />
				<span className="text-body font-semibold">{BRAND.name}</span>
			</Link>

			<nav aria-label={t('mainNavigation')} className="hidden items-center gap-1 sm:flex">
				<Link href="/docs" className={navLink}>
					{t('docs')}
				</Link>
				<a href={BRAND.supportUrl} rel="external" className={navLink}>
					{t('support')}
				</a>
			</nav>

			<div className="flex-1" />

			<ThemeToggle />

			{user === null ? (
				<Button variant="ghost" size="sm" href="/logout">
					{t('signOut')}
				</Button>
			) : (
				<div className="ml-2 flex items-center border-l border-border pl-4">
					<UserMenu user={user} compact />
				</div>
			)}
		</header>
	);
}
