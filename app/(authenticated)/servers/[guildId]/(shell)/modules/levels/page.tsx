import { resolveGuild } from '@/lib/guild-access';
import {
	mockChannels,
	mockLeaderboard,
	mockLevelsConfig,
	mockRoles,
	mockVariables
} from '@/lib/mock';
import type { GuildPageProps } from '@/lib/types/page';
import { LevelsScreen } from './LevelsScreen';
import { LevelsSkeleton } from '@/components/skeletons/LevelsSkeleton';

export const metadata = { title: 'Levels' };

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);
	await resolveGuild(guildId);
	if (query.state === 'loading') return <LevelsSkeleton />;

	return (
		<LevelsScreen
			config={mockLevelsConfig}
			channels={mockChannels}
			roles={mockRoles}
			variables={mockVariables}
			leaderboard={mockLeaderboard}
		/>
	);
}
