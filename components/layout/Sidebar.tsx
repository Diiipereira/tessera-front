'use client';

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { BrandMark } from '@/components/auth/BrandMark';
import { useSidebar } from '@/components/providers/sidebar-context';
import { BRAND } from '@/lib/brand';
import type { Plan } from '@/lib/types/billing';
import type { Guild } from '@/lib/types/guild';
import { GuildSwitcher } from './GuildSwitcher';
import { PlanCard } from './PlanCard';
import { SidebarNav } from './SidebarNav';

type SidebarProps = {
	guild: Guild;
	guilds: Guild[];
	plan: Plan;
};

export function Sidebar({ guild, guilds, plan }: SidebarProps) {
	const { collapsed, toggle } = useSidebar();

	return (
		<aside className="sticky top-0 hidden h-svh w-65 shrink-0 flex-col border-r border-border bg-bg-subtle transition-[width] duration-220 ease-overlay lg:flex sidebar-collapsed:w-16">
			<div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-3 sidebar-collapsed:justify-center sidebar-collapsed:px-2">
				<BrandMark size="sm" className="sidebar-collapsed:hidden" />
				<span className="min-w-0 flex-1 truncate text-body font-semibold sidebar-collapsed:hidden">
					{BRAND.name}
				</span>
				<button
					type="button"
					aria-expanded={!collapsed}
					aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
					className="grid size-8 shrink-0 place-items-center rounded-md text-text-muted transition-colors duration-120 ease-out hover:bg-surface-hover hover:text-text sidebar-collapsed:size-10"
					onClick={toggle}
				>
					{collapsed ? (
						<PanelLeftOpen className="size-4 shrink-0" aria-hidden="true" />
					) : (
						<PanelLeftClose className="size-4 shrink-0" aria-hidden="true" />
					)}
				</button>
			</div>

			<GuildSwitcher
				guild={guild}
				guilds={guilds}
				collapsible
				className="px-2 pt-3 pb-1 sidebar-collapsed:px-0"
			/>

			<SidebarNav guildId={guild.id} collapsible />

			<div className="shrink-0 border-t border-border p-3 sidebar-collapsed:hidden">
				<PlanCard plan={plan} guildId={guild.id} />
			</div>
		</aside>
	);
}
