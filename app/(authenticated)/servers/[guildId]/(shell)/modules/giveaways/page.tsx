import { redirect } from 'next/navigation';
import { GiveawaysSkeleton } from '@/components/skeletons/GiveawaysSkeleton';
import { apiGet } from '@/lib/api';
import type { GuildModuleStateDto } from '@/lib/api-url';
import { giveawayQuery } from '@/lib/giveaways-client';
import { ApiUnreachableError, resolveGuild } from '@/lib/guild-access';
import { loadChannels, loadRoles } from '@/lib/guild-shape';
import { toGiveaways, toGiveawaysConfig, type GiveawaysDto } from '@/lib/modules/giveaways';
import type { GuildPageProps } from '@/lib/types/page';
import { GiveawaysScreen } from './GiveawaysScreen';

export const metadata = { title: 'Giveaways' };

const EMPTY: GiveawaysDto = { giveaways: [], nextCursor: null, running: 0 };

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);

	await resolveGuild(guildId);

	if (query.state === 'loading') return <GiveawaysSkeleton />;

	const [state, page, channels, roles] = await Promise.all([
		apiGet<GuildModuleStateDto>(`/guilds/${guildId}/modules/giveaways`),
		apiGet<GiveawaysDto>(`/guilds/${guildId}/giveaways?${giveawayQuery([], 50)}`),
		loadChannels(guildId),
		loadRoles(guildId)
	]);

	if (state.status === 'unauthenticated') redirect('/login');

	if (state.status === 'unreachable')
		throw new ApiUnreachableError(state.reason, state.answered, state.code ?? null);

	return (
		<GiveawaysScreen
			guildId={guildId}
			config={toGiveawaysConfig(state.data)}
			version={state.data.version}
			giveaways={toGiveaways(page.status === 'ok' ? page.data : EMPTY)}
			channels={channels}
			roles={roles}
			now={new Date().toISOString()}
		/>
	);
}
