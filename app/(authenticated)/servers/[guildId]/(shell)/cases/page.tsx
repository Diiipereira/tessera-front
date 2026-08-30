import { redirect } from 'next/navigation';
import { CasesSkeleton } from '@/components/skeletons/CasesSkeleton';
import { apiGet, type ApiResult } from '@/lib/api';
import type { CapabilityCatalogDto } from '@/lib/api-url';
import { ApiUnreachableError } from '@/lib/guild-access';
import type { CasePage } from '@/lib/types/management';
import type { GuildPageProps } from '@/lib/types/page';
import { CasesScreen } from './CasesScreen';

export const metadata = { title: 'Cases' };

function unwrap<T>(result: ApiResult<T>): T {
	if (result.status === 'unauthenticated') redirect('/login');
	if (result.status === 'unreachable') {
		throw new ApiUnreachableError(result.reason, result.answered);
	}

	return result.data;
}

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);

	if (query.state === 'loading') return <CasesSkeleton />;

	const [catalogResult, result] = await Promise.all([
		apiGet<CapabilityCatalogDto>('/capabilities'),
		apiGet<CasePage>(`/guilds/${guildId}/cases`)
	]);

	return (
		<CasesScreen
			guildId={guildId}
			catalog={unwrap(catalogResult)}
			viewerRole={unwrap(result).viewerRole}
			cases={unwrap(result).cases}
			nextCursor={unwrap(result).nextCursor}
			now={new Date().toISOString()}
		/>
	);
}
