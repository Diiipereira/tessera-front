import { redirect } from 'next/navigation';
import { WelcomeSkeleton } from '@/components/skeletons/WelcomeSkeleton';
import { apiGet } from '@/lib/api';
import type { GuildModuleStateDto } from '@/lib/api-url';
import { ApiUnreachableError, resolveGuild } from '@/lib/guild-access';
import { loadChannels, loadRoles } from '@/lib/guild-shape';
import { toWelcomeConfig, welcomeVariables } from '@/lib/modules/welcome';
import type { GuildPageProps } from '@/lib/types/page';
import type { GuildSettings } from '@/lib/types/management';
import { WelcomeScreen } from './WelcomeScreen';

export const metadata = { title: 'Welcome' };

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);
	const guild = await resolveGuild(guildId);

	if (query.state === 'loading') return <WelcomeSkeleton />;

	const [state, settings, channels, roles] = await Promise.all([
		apiGet<GuildModuleStateDto>(`/guilds/${guildId}/modules/welcome`),
		apiGet<GuildSettings>(`/guilds/${guildId}/settings`),
		loadChannels(guildId),
		loadRoles(guildId)
	]);

	if (state.status === 'unauthenticated') redirect('/login');
	if (state.status === 'unreachable') throw new ApiUnreachableError(state.reason);
	if (settings.status === 'unauthenticated') redirect('/login');
	if (settings.status === 'unreachable') throw new ApiUnreachableError(settings.reason);

	return (
		<WelcomeScreen
			guildId={guildId}
			config={toWelcomeConfig(state.data, settings.data.embedColor)}
			defaultColor={settings.data.embedColor}
			version={state.data.version}
			channels={channels}
			roles={roles}
			variables={welcomeVariables(guild.name)}
		/>
	);
}
