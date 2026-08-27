'use client';

import { LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { BrandMark } from '@/components/auth/BrandMark';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { BRAND } from '@/lib/brand';
import type { DocNavGroup, DocSearchEntry } from '@/lib/docs';
import { useDashboardHref } from '@/lib/hooks/useLastGuild';
import { DocsMobileNav } from './DocsMobileNav';
import { DocsSearch } from './DocsSearch';

export function DocsHeader({
	groups,
	entries
}: {
	groups: DocNavGroup[];
	entries: DocSearchEntry[];
}) {
	const dashboardHref = useDashboardHref();

	return (
		<header className="sticky top-0 z-30 border-b border-border bg-bg/88 backdrop-blur-md">
			<div className="flex h-16 items-center gap-4 px-4 sm:px-6">
				<Link
					href="/"
					className="flex shrink-0 items-center gap-2.5 text-text no-underline hover:no-underline"
				>
					<BrandMark tone="primary" size="sm" />
					<span className="hidden text-h4 sm:inline">{BRAND.name}</span>
					<span className="rounded-sm bg-surface-sunken px-1.5 py-0.5 font-mono text-overline text-text-muted uppercase">
						Docs
					</span>
				</Link>

				<DocsMobileNav groups={groups} />

				<div className="ml-auto shrink-0 sm:mx-auto sm:w-full sm:max-w-96 sm:min-w-0 sm:shrink">
					<DocsSearch entries={entries} />
				</div>

				<div className="flex shrink-0 items-center gap-2 sm:gap-3">
					<ThemeToggle />
					<Button variant="outline" href={dashboardHref} aria-label="Dashboard">
						<LayoutDashboard aria-hidden="true" />
						<span className="hidden sm:inline">Dashboard</span>
					</Button>
				</div>
			</div>
		</header>
	);
}
