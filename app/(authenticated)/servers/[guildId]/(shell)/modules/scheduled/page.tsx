import { resolveGuild } from '@/lib/guild-access';
import { ScheduledSkeleton } from '@/components/skeletons/ScheduledSkeleton';
import { mockChannels, mockScheduledConfig, mockVariables } from '@/lib/mock';
import { holdSkeleton } from '@/lib/skeleton-hold';
import type { GuildPageProps } from '@/lib/types/page';
import { ScheduledScreen } from './ScheduledScreen';

export const metadata = { title: 'Scheduled messages' };

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);
	await resolveGuild(guildId);
	if (query.state === 'loading') return <ScheduledSkeleton />;

	await holdSkeleton(query);

	return (
		<ScheduledScreen
			config={mockScheduledConfig}
			channels={mockChannels}
			variables={mockVariables}
		/>
	);
}
