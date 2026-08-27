import { resolveGuild } from '@/lib/guild-access';
import { mockAutoModConfig, mockChannels, mockRoles } from '@/lib/mock';
import { holdSkeleton } from '@/lib/skeleton-hold';
import type { GuildPageProps } from '@/lib/types/page';
import { AutoModScreen } from './AutoModScreen';
import { AutoModSkeleton } from '@/components/skeletons/AutoModSkeleton';

export const metadata = { title: 'AutoMod' };

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);
	await resolveGuild(guildId);
	if (query.state === 'loading') return <AutoModSkeleton />;

	await holdSkeleton(query);

	return <AutoModScreen config={mockAutoModConfig} channels={mockChannels} roles={mockRoles} />;
}
