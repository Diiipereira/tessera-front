import { redirect } from 'next/navigation';
import { CasesSkeleton } from '@/components/skeletons/CasesSkeleton';
import { apiGet } from '@/lib/api';
import { ApiUnreachableError } from '@/lib/guild-access';
import type { CasePage } from '@/lib/types/management';
import type { GuildPageProps } from '@/lib/types/page';
import { CasesScreen } from './CasesScreen';

export const metadata = { title: 'Cases' };

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);

	if (query.state === 'loading') return <CasesSkeleton />;

	const result = await apiGet<CasePage>(`/guilds/${guildId}/cases`);

	if (result.status === 'unauthenticated') redirect('/login');
	if (result.status === 'unreachable') {
		throw new ApiUnreachableError(result.reason, result.answered);
	}

	return (
		<CasesScreen
			guildId={guildId}
			cases={result.data.cases}
			nextCursor={result.data.nextCursor}
			now={new Date().toISOString()}
		/>
	);
}
