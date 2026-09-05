'use client';

import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { BrandMark } from '@/components/auth/BrandMark';
import { LocaleToggle } from '@/components/layout/LocaleToggle';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Badge } from '@/components/ui/Badge';
import { BRAND } from '@/lib/brand';
import { cn } from '@/lib/utils/cn';
import { adminNav, isAdminNavActive } from './admin-nav';

const navBase =
	'flex h-10 w-full shrink-0 items-center gap-3 rounded-md px-3 text-body transition-colors duration-120 ease-out';

export function AdminShell({ children }: { children: ReactNode }) {
	const t = useTranslations('admin');
	const pathname = usePathname();

	return (
		<div className="flex min-h-svh bg-bg">
			<aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r border-border bg-bg-subtle lg:flex">
				<div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-3">
					<BrandMark size="sm" />
					<span className="min-w-0 flex-1 truncate text-body font-semibold">{BRAND.name}</span>
					<Badge variant="danger">{t('staff')}</Badge>
				</div>

				<nav aria-label={t('platform')} className="flex flex-col gap-1 p-2">
					{adminNav.map((item) => {
						const active = isAdminNavActive(pathname, item.href);
						const Icon = item.icon;

						return (
							<Link
								key={item.id}
								href={item.href}
								aria-current={active ? 'page' : undefined}
								className={cn(
									navBase,
									active
										? 'bg-primary-subtle text-primary'
										: 'text-text-muted hover:bg-surface-hover hover:text-text'
								)}
							>
								<Icon className="size-4 shrink-0" aria-hidden="true" />
								<span className="min-w-0 flex-1 truncate text-left">{t(`nav.${item.id}`)}</span>
							</Link>
						);
					})}
				</nav>

				<div className="mt-auto border-t border-border p-3">
					<Link
						href="/servers"
						className="flex items-center gap-2 text-body-sm text-text-muted transition-colors duration-120 ease-out hover:text-text"
					>
						<ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
						{t('backToServers')}
					</Link>
				</div>
			</aside>

			<div className="flex min-w-0 flex-1 flex-col">
				<header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-bg px-4 sm:px-6">
					<ShieldCheck className="size-4 shrink-0 text-danger" aria-hidden="true" />
					<span className="text-body-sm text-text-muted">{t('subtitle')}</span>

					<div className="flex-1" />

					<nav aria-label={t('sections')} className="flex items-center gap-1 lg:hidden">
						{adminNav.map((item) => (
							<Link
								key={item.id}
								href={item.href}
								aria-current={isAdminNavActive(pathname, item.href) ? 'page' : undefined}
								className={cn(
									'rounded-md px-2.5 py-1 text-body-sm transition-colors duration-120 ease-out',
									isAdminNavActive(pathname, item.href)
										? 'bg-primary-subtle text-primary'
										: 'text-text-muted hover:text-text'
								)}
							>
								{t(`nav.${item.id}`)}
							</Link>
						))}
					</nav>

					<ThemeToggle />

					<LocaleToggle className="hidden lg:flex" />
				</header>

				<main className="min-w-0 flex-1">{children}</main>
			</div>
		</div>
	);
}
