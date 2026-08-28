import { redirect } from 'next/navigation';
import { SettingsSkeleton } from '@/components/skeletons/SettingsSkeleton';
import { apiGet } from '@/lib/api';
import { ApiUnreachableError, resolveGuild } from '@/lib/guild-access';
import type { GuildPageProps } from '@/lib/types/page';
import type { GuildSettings } from '@/lib/types/management';
import { SettingsScreen } from './SettingsScreen';

export const metadata = { title: 'Settings' };

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);
	const guild = await resolveGuild(guildId);

	if (query.state === 'loading') return <SettingsSkeleton />;

	const settings = await apiGet<GuildSettings>(`/guilds/${guildId}/settings`);

	if (settings.status === 'unauthenticated') redirect('/login');
	if (settings.status === 'unreachable')
		throw new ApiUnreachableError(settings.reason, settings.answered);

	return <SettingsScreen guildId={guildId} settings={settings.data} guildName={guild.name} />;
}
