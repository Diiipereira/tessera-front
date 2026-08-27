import { resolveGuild } from '@/lib/guild-access';
import { mockGuildSettings, mockTeam } from '@/lib/mock';
import { SettingsScreen } from './SettingsScreen';

export const metadata = { title: 'Settings' };

export default async function Page({ params }: { params: Promise<{ guildId: string }> }) {
	const { guildId } = await params;
	const guild = await resolveGuild(guildId);

	return <SettingsScreen settings={mockGuildSettings} guildName={guild.name} team={mockTeam} />;
}
