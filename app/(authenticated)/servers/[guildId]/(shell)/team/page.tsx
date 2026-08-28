import { redirect } from 'next/navigation';
import { apiGet, type ApiResult } from '@/lib/api';
import type { CapabilityCatalogDto, InviteListDto, TeamListDto } from '@/lib/api-url';
import { ApiUnreachableError } from '@/lib/guild-access';
import { can, MANAGE_TEAM } from '@/lib/team';
import type { GuildPageProps } from '@/lib/types/page';
import { TeamScreen } from './TeamScreen';

export const metadata = { title: 'Team' };

function unwrap<T>(result: ApiResult<T>): T {
	if (result.status === 'unauthenticated') redirect('/login');
	if (result.status === 'unreachable') {
		throw new ApiUnreachableError(result.reason, result.answered);
	}

	return result.data;
}

export default async function Page({ params }: GuildPageProps) {
	const { guildId } = await params;
	const [catalogResult, teamResult] = await Promise.all([
		apiGet<CapabilityCatalogDto>('/capabilities'),
		apiGet<TeamListDto>(`/guilds/${guildId}/team`)
	]);

	const catalog = unwrap(catalogResult);
	const team = unwrap(teamResult);

	const links = can(catalog, team.viewerRole, MANAGE_TEAM)
		? await apiGet<InviteListDto>(`/guilds/${guildId}/invites`)
		: null;

	return (
		<TeamScreen
			guildId={guildId}
			catalog={catalog}
			team={team}
			invites={links?.status === 'ok' ? links.data.invites : []}
			invitesFailed={links !== null && links.status !== 'ok'}
			now={new Date().toISOString()}
		/>
	);
}
