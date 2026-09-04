import { redirect } from 'next/navigation';
import { ReactionRolesSkeleton } from '@/components/skeletons/ReactionRolesSkeleton';
import { apiGet } from '@/lib/api';
import type { GuildModuleStateDto } from '@/lib/api-url';
import { ApiUnreachableError, resolveGuild } from '@/lib/guild-access';
import { loadChannels, loadRoles } from '@/lib/guild-shape';
import { toReactionRolesConfig, type ReactionPanelDto } from '@/lib/modules/reaction-roles';
import type { GuildPageProps } from '@/lib/types/page';
import { ReactionRolesScreen } from './ReactionRolesScreen';

export const metadata = { title: 'Reaction roles' };

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);
	await resolveGuild(guildId);

	if (query.state === 'loading') return <ReactionRolesSkeleton />;

	const [state, panels, channels, roles] = await Promise.all([
		apiGet<GuildModuleStateDto>(`/guilds/${guildId}/modules/reaction-roles`),
		apiGet<{ panels: ReactionPanelDto[] }>(`/guilds/${guildId}/reaction-roles`),
		loadChannels(guildId),
		loadRoles(guildId)
	]);

	if (state.status === 'unauthenticated' || panels.status === 'unauthenticated') redirect('/login');

	if (state.status === 'unreachable')
		throw new ApiUnreachableError(state.reason, state.answered, state.code ?? null);

	if (panels.status === 'unreachable')
		throw new ApiUnreachableError(panels.reason, panels.answered, panels.code ?? null);

	return (
		<ReactionRolesScreen
			guildId={guildId}
			config={toReactionRolesConfig(state.data, panels.data.panels)}
			version={state.data.version}
			channels={channels}
			roles={roles}
		/>
	);
}
