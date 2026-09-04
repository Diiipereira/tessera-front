import { redirect } from 'next/navigation';
import { LevelsSkeleton } from '@/components/skeletons/LevelsSkeleton';
import { apiGet } from '@/lib/api';
import type { GuildModuleStateDto } from '@/lib/api-url';
import { ApiUnreachableError, resolveGuild } from '@/lib/guild-access';
import { loadChannels, loadRoles } from '@/lib/guild-shape';
import {
	levelVariables,
	toLeaderboard,
	toLevelsConfig,
	type LeaderboardDto,
	type LevelRewardDto
} from '@/lib/modules/levels';
import type { GuildPageProps } from '@/lib/types/page';
import type { GuildSettings } from '@/lib/types/management';
import { LevelsScreen } from './LevelsScreen';

export const metadata = { title: 'Levels' };

const EMPTY_BOARD: LeaderboardDto = { entries: [], members: 0 };

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);
	const guild = await resolveGuild(guildId);

	if (query.state === 'loading') return <LevelsSkeleton />;

	const [state, rewards, board, settings, channels, roles] = await Promise.all([
		apiGet<GuildModuleStateDto>(`/guilds/${guildId}/modules/levels`),
		apiGet<{ rewards: LevelRewardDto[] }>(`/guilds/${guildId}/levels/rewards`),
		apiGet<LeaderboardDto>(`/guilds/${guildId}/levels/leaderboard`),
		apiGet<GuildSettings>(`/guilds/${guildId}/settings`),
		loadChannels(guildId),
		loadRoles(guildId)
	]);

	if (
		state.status === 'unauthenticated' ||
		rewards.status === 'unauthenticated' ||
		settings.status === 'unauthenticated'
	)
		redirect('/login');

	if (state.status === 'unreachable')
		throw new ApiUnreachableError(state.reason, state.answered, state.code ?? null);

	if (rewards.status === 'unreachable')
		throw new ApiUnreachableError(rewards.reason, rewards.answered, rewards.code ?? null);

	if (settings.status === 'unreachable')
		throw new ApiUnreachableError(settings.reason, settings.answered, settings.code ?? null);

	return (
		<LevelsScreen
			guildId={guildId}
			config={toLevelsConfig(state.data, rewards.data.rewards, settings.data.embedColor)}
			defaultColor={settings.data.embedColor}
			version={state.data.version}
			channels={channels}
			roles={roles}
			variables={levelVariables(guild.name)}
			leaderboard={toLeaderboard(board.status === 'ok' ? board.data : EMPTY_BOARD)}
		/>
	);
}
