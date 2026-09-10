import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { LoggingSkeleton } from '@/components/skeletons/LoggingSkeleton';
import { apiGet } from '@/lib/api';
import type { GuildModuleStateDto } from '@/lib/api-url';
import { ApiUnreachableError, resolveGuild } from '@/lib/guild-access';
import { loadChannels, loadRoles } from '@/lib/guild-shape';
import { toLoggingConfig, type LogDestinationDto } from '@/lib/modules/logging';
import type { LoggingPreviewDto } from '@/lib/modules/log-preview';
import type { GuildPageProps } from '@/lib/types/page';
import type { GuildSettingsDto } from '@/lib/types/management';
import { LoggingScreen } from './LoggingScreen';

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('modules.logging');

	return { title: t('title') };
}

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);
	await resolveGuild(guildId);

	if (query.state === 'loading') return <LoggingSkeleton />;

	const [state, routes, channels, roles, preview, settings] = await Promise.all([
		apiGet<GuildModuleStateDto>(`/guilds/${guildId}/modules/logging`),
		apiGet<{ events: LogDestinationDto[] }>(`/guilds/${guildId}/logging`),
		loadChannels(guildId),
		loadRoles(guildId),
		apiGet<LoggingPreviewDto>(`/guilds/${guildId}/logging/preview`),
		apiGet<GuildSettingsDto>(`/guilds/${guildId}/settings`)
	]);

	if (state.status === 'unauthenticated' || routes.status === 'unauthenticated') redirect('/login');

	if (state.status === 'unreachable')
		throw new ApiUnreachableError(state.reason, state.answered, state.code ?? null);

	if (routes.status === 'unreachable')
		throw new ApiUnreachableError(routes.reason, routes.answered, routes.code ?? null);

	return (
		<LoggingScreen
			guildId={guildId}
			config={toLoggingConfig(state.data, routes.data.events)}
			version={state.data.version}
			channels={channels}
			roles={roles}
			preview={preview.status === 'ok' ? preview.data : null}
			now={new Date().toISOString()}
			botName={settings.status === 'ok' ? settings.data.botNickname : ''}
			botAvatarUrl={settings.status === 'ok' ? settings.data.botAvatarUrl : null}
		/>
	);
}
