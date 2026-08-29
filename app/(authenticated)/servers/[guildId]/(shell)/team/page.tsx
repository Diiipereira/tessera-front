import { redirect } from 'next/navigation';
import { apiGet, type ApiResult } from '@/lib/api';
import type { CapabilityCatalogDto, TeamListDto } from '@/lib/api-url';
import { ApiUnreachableError } from '@/lib/guild-access';
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

	return (
		<TeamScreen
			guildId={guildId}
			catalog={unwrap(catalogResult)}
			team={unwrap(teamResult)}
			now={new Date().toISOString()}
		/>
	);
}
