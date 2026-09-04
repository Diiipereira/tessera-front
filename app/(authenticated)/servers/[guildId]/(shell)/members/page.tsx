import { redirect } from 'next/navigation';
import { MembersSkeleton } from '@/components/skeletons/MembersSkeleton';
import { apiGet } from '@/lib/api';
import type { GuildModuleStateDto } from '@/lib/api-url';
import { ApiUnreachableError, resolveGuild } from '@/lib/guild-access';
import { loadRoles } from '@/lib/guild-shape';
import { blankMemberQuery, toMembers, toSearchParams, type MemberListDto } from '@/lib/members';
import type { GuildPageProps } from '@/lib/types/page';
import { MembersScreen } from './MembersScreen';

export const metadata = { title: 'Members' };

const currencyOf = (state: GuildModuleStateDto): string | null => {
	const named = state.config['currencyName'];

	return typeof named === 'string' && named.trim() !== '' ? named.trim() : null;
};

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);
	const guild = await resolveGuild(guildId);

	if (query.state === 'loading') return <MembersSkeleton />;

	const listing = `/guilds/${guildId}/members?${toSearchParams(blankMemberQuery).toString()}`;
	const [members, economy, levels, roles] = await Promise.all([
		apiGet<MemberListDto>(listing),
		apiGet<GuildModuleStateDto>(`/guilds/${guildId}/modules/economy`),
		apiGet<GuildModuleStateDto>(`/guilds/${guildId}/modules/levels`),
		loadRoles(guildId)
	]);

	if (
		members.status === 'unauthenticated' ||
		economy.status === 'unauthenticated' ||
		levels.status === 'unauthenticated'
	) {
		redirect('/login');
	}

	if (members.status === 'unreachable')
		throw new ApiUnreachableError(members.reason, members.answered, members.code ?? null);

	if (economy.status === 'unreachable')
		throw new ApiUnreachableError(economy.reason, economy.answered, economy.code ?? null);

	if (levels.status === 'unreachable')
		throw new ApiUnreachableError(levels.reason, levels.answered, levels.code ?? null);

	return (
		<MembersScreen
			guildId={guildId}
			page={{
				members: toMembers(members.data.members),
				total: members.data.total,
				searched: members.data.searched
			}}
			memberCount={guild.memberCount}
			currency={currencyOf(economy.data)}
			levelsOn={levels.data.enabled}
			roles={roles}
			now={new Date().toISOString()}
		/>
	);
}
