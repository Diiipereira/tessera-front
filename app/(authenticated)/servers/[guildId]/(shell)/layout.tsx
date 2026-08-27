import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { apiGet } from '@/lib/api';
import type { AuthenticatedUserDto } from '@/lib/api-url';
import { loadGuilds, resolveGuild } from '@/lib/guild-access';
import { toSessionUser } from '@/lib/guild-presentation';
import {
	mockAccountPreferences,
	mockAccountSessions,
	mockBotOnline,
	mockPlan,
	mockUser
} from '@/lib/mock';

export default async function GuildLayout({
	children,
	params
}: {
	children: ReactNode;
	params: Promise<{ guildId: string }>;
}) {
	const { guildId } = await params;
	const [guild, directory, meResult] = await Promise.all([
		resolveGuild(guildId),
		loadGuilds(),
		apiGet<AuthenticatedUserDto>('/auth/me')
	]);

	return (
		<AppShell
			guild={guild}
			guilds={directory.managed}
			user={meResult.status === 'ok' ? toSessionUser(meResult.data) : mockUser}
			plan={mockPlan}
			botOnline={mockBotOnline}
			preferences={mockAccountPreferences}
			sessions={mockAccountSessions}
		>
			{children}
		</AppShell>
	);
}
