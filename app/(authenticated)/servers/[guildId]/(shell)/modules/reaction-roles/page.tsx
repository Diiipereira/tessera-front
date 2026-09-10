import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { ReactionRolesSkeleton } from '@/components/skeletons/ReactionRolesSkeleton';
import { apiGet } from '@/lib/api';
import type { GuildModuleStateDto } from '@/lib/api-url';
import { ApiUnreachableError, resolveGuild } from '@/lib/guild-access';
import { loadChannels, loadRoles } from '@/lib/guild-shape';
import { toReactionRolesConfig, type ReactionPanelDto } from '@/lib/modules/reaction-roles';
import type { GuildPageProps } from '@/lib/types/page';
import type { GuildSettingsDto } from '@/lib/types/management';
import { ReactionRolesScreen } from './ReactionRolesScreen';

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('modules.reactionRoles');

	return { title: t('title') };
}

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);
	await resolveGuild(guildId);

	if (query.state === 'loading') return <ReactionRolesSkeleton />;

	const [state, panels, settings, channels, roles] = await Promise.all([
		apiGet<GuildModuleStateDto>(`/guilds/${guildId}/modules/reaction-roles`),
		apiGet<{ panels: ReactionPanelDto[] }>(`/guilds/${guildId}/reaction-roles`),
		apiGet<GuildSettingsDto>(`/guilds/${guildId}/settings`),
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
		<ReactionRolesScreen
			guildId={guildId}
			config={toReactionRolesConfig(state.data, panels.data.panels, settings.data.embedColor)}
			version={state.data.version}
			channels={channels}
			roles={roles}
			defaultColor={settings.data.embedColor}
			botName={settings.data.botNickname}
			botAvatarUrl={settings.data.botAvatarUrl}
		/>
	);
}
