import { redirect } from 'next/navigation';
import { apiGet } from '@/lib/api';
import type { GuildModuleListDto } from '@/lib/api-url';
import { BRAND } from '@/lib/brand';
import { ApiUnreachableError, lookupGuild, resolveGuild } from '@/lib/guild-access';
import { loadChannels, loadRoles } from '@/lib/guild-shape';
import { toSetupModules } from '@/lib/setup';
import type { GuildSettingsDto } from '@/lib/types/management';
import { SetupWizard } from './SetupWizard';

export async function generateMetadata({ params }: { params: Promise<{ guildId: string }> }) {
	const { guildId } = await params;
	const guild = await lookupGuild(guildId);

	return { title: `Set up ${guild?.name ?? 'server'} · ${BRAND.name}` };
}

export default async function Page({ params }: { params: Promise<{ guildId: string }> }) {
	const { guildId } = await params;
	const guild = await resolveGuild(guildId);

	const [settings, states, channels, roles] = await Promise.all([
		apiGet<GuildSettingsDto>(`/guilds/${guildId}/settings`),
		apiGet<GuildModuleListDto>(`/guilds/${guildId}/modules`),
		loadChannels(guildId),
		loadRoles(guildId)
	]);

	if (settings.status === 'unauthenticated' || states.status === 'unauthenticated')
		redirect('/login');

	if (settings.status === 'unreachable')
		throw new ApiUnreachableError(settings.reason, settings.answered, settings.code ?? null);

	if (states.status === 'unreachable')
		throw new ApiUnreachableError(states.reason, states.answered, states.code ?? null);

	return (
		<SetupWizard
			guild={guild}
			settings={settings.data}
			modules={toSetupModules(states.data.modules)}
			channels={channels}
			roles={roles}
		/>
	);
}
