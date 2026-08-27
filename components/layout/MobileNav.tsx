'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useSidebar } from '@/components/providers/sidebar-context';
import type { Plan } from '@/lib/types/billing';
import type { Guild } from '@/lib/types/guild';
import { GuildSwitcher } from './GuildSwitcher';
import { PlanCard } from './PlanCard';
import { SidebarNav } from './SidebarNav';

type MobileNavProps = {
	guild: Guild;
	guilds: Guild[];
	plan: Plan;
};

export function MobileNav({ guild, guilds, plan }: MobileNavProps) {
	const { mobileOpen, setMobileOpen } = useSidebar();
	const close = () => {
		setMobileOpen(false);
	};

	return (
		<DialogPrimitive.Root open={mobileOpen} onOpenChange={setMobileOpen}>
			<DialogPrimitive.Portal>
				<DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-overlay backdrop-blur-xs data-[state=closed]:animate-fade-out data-[state=open]:animate-pop lg:hidden" />
				<DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 flex w-80 max-w-[calc(100vw-3rem)] flex-col border-r border-border bg-bg-subtle shadow-3 data-[state=open]:animate-slide-in-left lg:hidden">
					<DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>

					<div className="relative">
						<GuildSwitcher
							guild={guild}
							guilds={guilds}
							className="flex h-14 items-center border-b border-border px-3 pr-14"
							onNavigate={close}
						/>
						<DialogPrimitive.Close
							aria-label="Close navigation"
							className="absolute top-3 right-3 grid size-8 place-items-center rounded-md text-text-muted transition-colors duration-120 ease-out hover:bg-surface-hover hover:text-text"
						>
							<X className="size-4" aria-hidden="true" />
						</DialogPrimitive.Close>
					</div>

					<SidebarNav guildId={guild.id} onNavigate={close} />

					<div className="border-t border-border p-3">
						<PlanCard plan={plan} guildId={guild.id} />
					</div>
				</DialogPrimitive.Content>
			</DialogPrimitive.Portal>
		</DialogPrimitive.Root>
	);
}
