'use client';

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNavigation } from '@/components/providers/navigation-context';
import { breadcrumbsFor, guildHref } from '@/lib/navigation';
import type { Guild } from '@/lib/types/guild';

const linkClass = 'shrink truncate text-text-muted no-underline hover:text-text hover:no-underline';

export function Breadcrumbs({ guild }: { guild: Guild }) {
	const pathname = usePathname();
	const { pendingHref } = useNavigation();
	const crumbs = breadcrumbsFor(guild.id, pendingHref ?? pathname);

	return (
		<nav
			aria-label="Breadcrumb"
			className="flex min-w-0 items-center gap-2 overflow-hidden text-body"
		>
			<Link href={guildHref(guild.id, '')} className={linkClass}>
				{guild.name}
			</Link>
			{crumbs.map((crumb) => (
				<span key={crumb.label} className="contents">
					<ChevronRight className="size-3.5 shrink-0 text-text-subtle" aria-hidden="true" />
					{crumb.href ? (
						<Link href={crumb.href} className={linkClass}>
							{crumb.label}
						</Link>
					) : (
						<span aria-current="page" className="shrink truncate font-medium">
							{crumb.label}
						</span>
					)}
				</span>
			))}
		</nav>
	);
}
