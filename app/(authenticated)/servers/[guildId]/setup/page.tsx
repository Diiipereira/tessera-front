import { BRAND } from '@/lib/brand';
import { lookupGuild, resolveGuild } from '@/lib/guild-access';
import { mockChannels, mockRoles } from '@/lib/mock';
import { SetupWizard } from './SetupWizard';

export async function generateMetadata({ params }: { params: Promise<{ guildId: string }> }) {
	const { guildId } = await params;
	const guild = await lookupGuild(guildId);

	return { title: `Set up ${guild?.name ?? 'server'} · ${BRAND.name}` };
}

export default async function Page({ params }: { params: Promise<{ guildId: string }> }) {
	const { guildId } = await params;
	const guild = await resolveGuild(guildId);

	return <SetupWizard guild={guild} channels={mockChannels} roles={mockRoles} />;
}
