import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { toAccountSessions, type SessionSummaryDto } from '@/lib/account';
import { apiGet } from '@/lib/api';
import type { AuthenticatedUserDto } from '@/lib/api-url';
import { loadGuilds, resolveGuild } from '@/lib/guild-access';
import { toSessionUser } from '@/lib/guild-presentation';
import { readLocale } from '@/lib/locale-server';
import { mockAccountPreferences, mockBotOnline, mockPlan, mockUser } from '@/lib/mock';

export default async function GuildLayout({
	children,
	params
}: {
	children: ReactNode;
	params: Promise<{ guildId: string }>;
}) {
	const { guildId } = await params;
	const [guild, directory, meResult, locale, sessions, common] = await Promise.all([
		resolveGuild(guildId),
		loadGuilds(),
		apiGet<AuthenticatedUserDto>('/auth/me'),
		readLocale(),
		apiGet<SessionSummaryDto[]>('/auth/sessions'),
		getTranslations('common')
	]);

	return (
		<AppShell
			guild={guild}
			guilds={directory.managed}
			user={meResult.status === 'ok' ? toSessionUser(meResult.data) : mockUser}
			plan={mockPlan}
			botOnline={mockBotOnline}
			preferences={{ ...mockAccountPreferences, locale }}
			sessions={sessions.status === 'ok' ? toAccountSessions(sessions.data, common('unknown')) : []}
			now={new Date().toISOString()}
		>
			{children}
		</AppShell>
	);
}
