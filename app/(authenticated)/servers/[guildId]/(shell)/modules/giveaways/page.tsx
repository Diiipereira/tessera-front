import { resolveGuild } from '@/lib/guild-access';
import { GiveawaysSkeleton } from '@/components/skeletons/GiveawaysSkeleton';
import { mockGiveawaysConfig, mockRoles } from '@/lib/mock';
import { holdSkeleton } from '@/lib/skeleton-hold';
import type { GuildPageProps } from '@/lib/types/page';
import { GiveawaysScreen } from './GiveawaysScreen';

export const metadata = { title: 'Giveaways' };

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);
	await resolveGuild(guildId);
	if (query.state === 'loading') return <GiveawaysSkeleton />;

	await holdSkeleton(query);

	return <GiveawaysScreen config={mockGiveawaysConfig} roles={mockRoles} />;
}
