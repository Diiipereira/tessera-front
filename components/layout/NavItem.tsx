'use client';

import { Crown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useNavigation } from '@/components/providers/navigation-context';
import { useSidebar } from '@/components/providers/sidebar-context';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils/cn';
import type { GuildHref, NavItem as NavItemData } from '@/lib/navigation';

const base =
	'flex h-10 w-full shrink-0 items-center gap-3 rounded-md px-3 text-body transition-colors duration-120 ease-out';

const states = {
	active: 'bg-primary-subtle text-primary',
	idle: 'text-text-muted hover:bg-surface-hover hover:text-text'
};

const collapsedLayout =
	'sidebar-collapsed:mx-auto sidebar-collapsed:w-10 sidebar-collapsed:justify-center sidebar-collapsed:px-0';

type NavItemProps = {
	item: NavItemData;
	href: GuildHref;
	active: boolean;
	collapsible?: boolean;
	onNavigate?: () => void;
};

export function NavItem({ item, href, active, collapsible = false, onNavigate }: NavItemProps) {
	const t = useTranslations('nav');
	const { collapsed } = useSidebar();
	const { start } = useNavigation();
	const Icon = item.icon;
	const showTooltip = collapsible && collapsed;
	const label = t(item.id);

	const link = (
		<Link
			href={href}
			aria-current={active ? 'page' : undefined}
			aria-label={label}
			className={cn(base, active ? states.active : states.idle, collapsible && collapsedLayout)}
			onClick={() => {
				start(href);
				onNavigate?.();
			}}
		>
			<Icon className="size-4 shrink-0" aria-hidden="true" />
			<span
				className={cn(
					'min-w-0 flex-1 truncate text-left',
					collapsible && 'sidebar-collapsed:hidden'
				)}
			>
				{label}
			</span>
			{item.premium ? (
				<Crown
					className={cn(
						'size-3.5 shrink-0 text-warning',
						collapsible && 'sidebar-collapsed:hidden'
					)}
					aria-label={t('premium')}
				/>
			) : null}
		</Link>
	);

	if (!showTooltip) return link;

	return (
		<Tooltip content={label} side="right" asChild>
			{link}
		</Tooltip>
	);
}
