import { redirect } from 'next/navigation';
import { ScheduledSkeleton } from '@/components/skeletons/ScheduledSkeleton';
import { apiGet } from '@/lib/api';
import type { GuildModuleStateDto } from '@/lib/api-url';
import { ApiUnreachableError, resolveGuild } from '@/lib/guild-access';
import { loadChannels } from '@/lib/guild-shape';
import {
	scheduledVariables,
	toScheduledConfig,
	type ScheduledMessagesDto
} from '@/lib/modules/scheduled';
import type { GuildSettings } from '@/lib/types/management';
import type { GuildPageProps } from '@/lib/types/page';
import { ScheduledScreen } from './ScheduledScreen';

export const metadata = { title: 'Scheduled messages' };

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);
	const guild = await resolveGuild(guildId);

	if (query.state === 'loading') return <ScheduledSkeleton />;

	const [state, page, settings, channels] = await Promise.all([
		apiGet<GuildModuleStateDto>(`/guilds/${guildId}/modules/scheduled`),
		apiGet<ScheduledMessagesDto>(`/guilds/${guildId}/scheduled`),
		apiGet<GuildSettings>(`/guilds/${guildId}/settings`),
		loadChannels(guildId)
	]);

	if (
		state.status === 'unauthenticated' ||
		page.status === 'unauthenticated' ||
		settings.status === 'unauthenticated'
	)
		redirect('/login');

	if (state.status === 'unreachable')
		throw new ApiUnreachableError(state.reason, state.answered, state.code ?? null);

	if (page.status === 'unreachable')
		throw new ApiUnreachableError(page.reason, page.answered, page.code ?? null);

	if (settings.status === 'unreachable')
		throw new ApiUnreachableError(settings.reason, settings.answered, settings.code ?? null);

	return (
		<ScheduledScreen
			guildId={guildId}
			config={toScheduledConfig(state.data, page.data, settings.data.embedColor)}
			defaultColor={settings.data.embedColor}
			version={state.data.version}
			channels={channels}
			variables={scheduledVariables(guild.name)}
			now={new Date().toISOString()}
		/>
	);
}
