import { MembersSkeleton } from '@/components/skeletons/MembersSkeleton';
import { resolveGuild } from '@/lib/guild-access';
import { mockEconomyConfig, mockMembers, mockRoles } from '@/lib/mock';
import { holdSkeleton } from '@/lib/skeleton-hold';
import type { GuildPageProps } from '@/lib/types/page';
import { MembersScreen } from './MembersScreen';

export const metadata = { title: 'Members' };

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);
	const guild = await resolveGuild(guildId);

	if (query.state === 'loading') return <MembersSkeleton />;

	await holdSkeleton(query);

	return (
		<MembersScreen
			members={mockMembers}
			roles={mockRoles}
			memberCount={guild.memberCount}
			currency={mockEconomyConfig.currencyName}
		/>
	);
}
