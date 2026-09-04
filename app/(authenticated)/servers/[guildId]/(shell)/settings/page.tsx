import { redirect } from 'next/navigation';
import { SettingsSkeleton } from '@/components/skeletons/SettingsSkeleton';
import { apiGet } from '@/lib/api';
import { ApiUnreachableError, resolveGuild } from '@/lib/guild-access';
import type { GuildPageProps } from '@/lib/types/page';
import { toEditableSettings } from '@/lib/settings';
import type { GuildSettingsDto } from '@/lib/types/management';
import { SettingsScreen } from './SettingsScreen';

export const metadata = { title: 'Settings' };

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);
	const guild = await resolveGuild(guildId);

	if (query.state === 'loading') return <SettingsSkeleton />;

	const settings = await apiGet<GuildSettingsDto>(`/guilds/${guildId}/settings`);

	if (settings.status === 'unauthenticated') redirect('/login');
	if (settings.status === 'unreachable')
		throw new ApiUnreachableError(settings.reason, settings.answered, settings.code ?? null);

	return (
		<SettingsScreen
			guildId={guildId}
			settings={toEditableSettings(settings.data)}
			guildName={guild.name}
		/>
	);
}
