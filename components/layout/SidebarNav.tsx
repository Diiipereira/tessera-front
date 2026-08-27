'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useNavigation } from '@/components/providers/navigation-context';
import { findActiveNavItem, guildHref, navGroups } from '@/lib/navigation';
import { cn } from '@/lib/utils/cn';
import { NavItem } from './NavItem';

const headerBase = 'shrink-0 px-3 pt-5 pb-2';

const collapsedDivider =
	'sidebar-collapsed:mx-auto sidebar-collapsed:my-2 sidebar-collapsed:h-px sidebar-collapsed:w-8 sidebar-collapsed:bg-border sidebar-collapsed:p-0';

type SidebarNavProps = {
	guildId: string;
	collapsible?: boolean;
	onNavigate?: () => void;
};

export function SidebarNav({ guildId, collapsible = false, onNavigate }: SidebarNavProps) {
	const t = useTranslations('nav');
	const pathname = usePathname();
	const { pendingHref } = useNavigation();
	const activeItem = findActiveNavItem(guildId, pendingHref ?? pathname);

	return (
		<nav
			aria-label={t('serverNavigation')}
			className="flex flex-1 thin-scroll flex-col gap-1.5 overflow-y-auto p-2 sidebar-collapsed:px-0"
		>
			{navGroups.map((group, index) => (
				<div key={group.id} className="contents">
					<div
						className={cn(
							headerBase,
							collapsible && (index === 0 ? 'sidebar-collapsed:hidden' : collapsedDivider)
						)}
					>
						<span
							className={cn(
								'font-mono text-overline text-text-muted uppercase',
								collapsible && 'sidebar-collapsed:hidden'
							)}
						>
							{t(`groups.${group.id}`)}
						</span>
					</div>
					{group.items.map((item) => {
						const href = guildHref(guildId, item.path);
						return (
							<NavItem
								key={item.id}
								item={item}
								href={href}
								active={item.id === activeItem?.id}
								collapsible={collapsible}
								onNavigate={onNavigate}
							/>
						);
					})}
				</div>
			))}
		</nav>
	);
}
