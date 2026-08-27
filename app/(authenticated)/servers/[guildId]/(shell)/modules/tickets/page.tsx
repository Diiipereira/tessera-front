import { resolveGuild } from '@/lib/guild-access';
import { TicketsSkeleton } from '@/components/skeletons/TicketsSkeleton';
import {
	mockChannels,
	mockOpenTickets,
	mockRoles,
	mockTicketsConfig,
	mockVariables
} from '@/lib/mock';
import { holdSkeleton } from '@/lib/skeleton-hold';
import type { GuildPageProps } from '@/lib/types/page';
import { TicketsScreen } from './TicketsScreen';

export const metadata = { title: 'Tickets' };

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);
	await resolveGuild(guildId);
	if (query.state === 'loading') return <TicketsSkeleton />;

	await holdSkeleton(query);

	return (
		<TicketsScreen
			config={mockTicketsConfig}
			channels={mockChannels}
			roles={mockRoles}
			variables={mockVariables}
			openTickets={mockOpenTickets}
		/>
	);
}
