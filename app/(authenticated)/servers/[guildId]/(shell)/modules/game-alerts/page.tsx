import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { GameAlertsSkeleton } from '@/components/skeletons/GameAlertsSkeleton';
import { apiGet } from '@/lib/api';
import type { GuildModuleStateDto } from '@/lib/api-url';
import { ApiUnreachableError, resolveGuild } from '@/lib/guild-access';
import { loadChannels, loadRoles } from '@/lib/guild-shape';
import { toGameAlertsConfig } from '@/lib/modules/game-alerts';
import type { GuildPageProps } from '@/lib/types/page';
import { GameAlertsScreen } from './GameAlertsScreen';

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('modules.gameAlerts');

	return { title: t('title') };
}

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);

	await resolveGuild(guildId);

	if (query.state === 'loading') return <GameAlertsSkeleton />;

	const [state, channels, roles] = await Promise.all([
		apiGet<GuildModuleStateDto>(`/guilds/${guildId}/modules/game-alerts`),
		loadChannels(guildId),
		loadRoles(guildId)
	]);

	if (state.status === 'unauthenticated') redirect('/login');

	if (state.status === 'unreachable')
		throw new ApiUnreachableError(state.reason, state.answered, state.code ?? null);

	return (
		<GameAlertsScreen
			guildId={guildId}
			config={toGameAlertsConfig(state.data)}
			version={state.data.version}
			channels={channels}
			roles={roles}
		/>
	);
}
