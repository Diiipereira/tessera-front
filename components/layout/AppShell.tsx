'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AccountPanel } from '@/components/account/AccountPanel';
import { NavigationProvider } from '@/components/providers/NavigationProvider';
import { useNavigation } from '@/components/providers/navigation-context';
import { SidebarProvider } from '@/components/providers/SidebarProvider';
import { routeSkeleton } from '@/components/skeletons/RouteSkeleton';
import { rememberGuild } from '@/lib/hooks/useLastGuild';
import type { AccountPreferences, AccountSession } from '@/lib/types/account';
import type { Plan } from '@/lib/types/billing';
import type { Guild } from '@/lib/types/guild';
import type { SessionUser } from '@/lib/types/session';
import { BotOfflineBanner } from './BotOfflineBanner';
import { CommandPalette } from './CommandPalette';
import { MobileNav } from './MobileNav';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

type AppShellProps = {
	guild: Guild;
	guilds: Guild[];
	user: SessionUser;
	plan: Plan;
	botOnline: boolean;
	preferences: AccountPreferences;
	sessions: AccountSession[];
	children: ReactNode;
};

function ShellMain({ children }: { children: ReactNode }) {
	const { pendingHref } = useNavigation();
	const skeleton = pendingHref === null ? null : routeSkeleton(pendingHref);

	return (
		<main className="relative min-h-0 min-w-0 flex-1 overflow-y-auto">{skeleton ?? children}</main>
	);
}

export function AppShell({
	guild,
	guilds,
	user,
	plan,
	botOnline,
	preferences,
	sessions,
	children
}: AppShellProps) {
	const [paletteOpen, setPaletteOpen] = useState(false);
	const [accountOpen, setAccountOpen] = useState(false);
	const accountTrigger = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		rememberGuild(guild.id);
	}, [guild.id]);

	return (
		<SidebarProvider>
			<NavigationProvider>
				<div className="flex h-svh overflow-hidden bg-bg">
					<Sidebar guild={guild} guilds={guilds} plan={plan} />

					<div className="flex min-w-0 flex-1 flex-col">
						<Topbar
							guild={guild}
							user={user}
							onSearch={() => {
								setPaletteOpen(true);
							}}
							onOpenAccount={() => {
								setAccountOpen(true);
							}}
							accountTriggerRef={accountTrigger}
						/>

						{botOnline ? null : <BotOfflineBanner />}

						<ShellMain>{children}</ShellMain>
					</div>
				</div>

				<MobileNav guild={guild} guilds={guilds} plan={plan} />
				<CommandPalette
					open={paletteOpen}
					onOpenChange={setPaletteOpen}
					guild={guild}
					guilds={guilds}
				/>
				<AccountPanel
					open={accountOpen}
					onOpenChange={setAccountOpen}
					returnFocusTo={accountTrigger}
					user={user}
					preferences={preferences}
					sessions={sessions}
					guilds={guilds}
				/>
			</NavigationProvider>
		</SidebarProvider>
	);
}
