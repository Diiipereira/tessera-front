import { redirect } from 'next/navigation';
import { TicketsSkeleton } from '@/components/skeletons/TicketsSkeleton';
import { apiGet } from '@/lib/api';
import type { GuildModuleStateDto } from '@/lib/api-url';
import { ApiUnreachableError, resolveGuild } from '@/lib/guild-access';
import { loadChannels, loadRoles } from '@/lib/guild-shape';
import {
	ticketVariables,
	toOpenTickets,
	toTicketsConfig,
	type TicketPanelDto,
	type TicketsDto
} from '@/lib/modules/tickets';
import { ticketQuery, LIVE_STATUSES } from '@/lib/tickets-client';
import type { GuildSettings } from '@/lib/types/management';
import type { GuildPageProps } from '@/lib/types/page';
import { TicketsScreen } from './TicketsScreen';

export const metadata = { title: 'Tickets' };

const EMPTY: TicketsDto = { tickets: [], nextCursor: null, open: 0 };

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);
	const guild = await resolveGuild(guildId);

	if (query.state === 'loading') return <TicketsSkeleton />;

	const [state, panels, open, settings, channels, roles] = await Promise.all([
		apiGet<GuildModuleStateDto>(`/guilds/${guildId}/modules/tickets`),
		apiGet<{ panels: TicketPanelDto[] }>(`/guilds/${guildId}/tickets/panels`),
		apiGet<TicketsDto>(`/guilds/${guildId}/tickets?${ticketQuery(LIVE_STATUSES, 25)}`),
		apiGet<GuildSettings>(`/guilds/${guildId}/settings`),
		loadChannels(guildId),
		loadRoles(guildId)
	]);

	if (
		state.status === 'unauthenticated' ||
		panels.status === 'unauthenticated' ||
		settings.status === 'unauthenticated'
	)
		redirect('/login');

	if (state.status === 'unreachable')
		throw new ApiUnreachableError(state.reason, state.answered, state.code ?? null);

	if (panels.status === 'unreachable')
		throw new ApiUnreachableError(panels.reason, panels.answered, panels.code ?? null);

	if (settings.status === 'unreachable')
		throw new ApiUnreachableError(settings.reason, settings.answered, settings.code ?? null);

	return (
		<TicketsScreen
			guildId={guildId}
			config={toTicketsConfig(state.data, panels.data.panels, settings.data.embedColor)}
			defaultColor={settings.data.embedColor}
			version={state.data.version}
			channels={channels}
			roles={roles}
			variables={ticketVariables(guild.name)}
			openTickets={toOpenTickets(open.status === 'ok' ? open.data : EMPTY)}
			now={new Date().toISOString()}
		/>
	);
}
