import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { ModerationSkeleton } from '@/components/skeletons/ModerationSkeleton';
import { apiGet } from '@/lib/api';
import type { GuildModuleStateDto } from '@/lib/api-url';
import { ApiUnreachableError, resolveGuild } from '@/lib/guild-access';
import { loadChannels, loadRoles } from '@/lib/guild-shape';
import { toModerationConfig } from '@/lib/modules/moderation';
import type { GuildPageProps } from '@/lib/types/page';
import { ModerationScreen } from './ModerationScreen';

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('modules.moderation');

	return { title: t('title') };
}

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);
	const guild = await resolveGuild(guildId);

	if (query.state === 'loading') return <ModerationSkeleton />;

	const [state, channels, roles] = await Promise.all([
		apiGet<GuildModuleStateDto>(`/guilds/${guildId}/modules/moderation`),
		loadChannels(guildId),
		loadRoles(guildId)
	]);

	if (state.status === 'unauthenticated') redirect('/login');
	if (state.status === 'unreachable') {
		throw new ApiUnreachableError(state.reason, state.answered, state.code ?? null);
	}

	return (
		<ModerationScreen
			guildId={guildId}
			guildName={guild.name}
			config={toModerationConfig(state.data)}
			version={state.data.version}
			channels={channels}
			roles={roles}
		/>
	);
}
