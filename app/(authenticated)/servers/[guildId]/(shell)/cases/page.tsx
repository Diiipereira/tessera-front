import { CasesSkeleton } from '@/components/skeletons/CasesSkeleton';
import { mockCases } from '@/lib/mock';
import { holdSkeleton } from '@/lib/skeleton-hold';
import type { GuildPageProps } from '@/lib/types/page';
import { CasesScreen } from './CasesScreen';

export const metadata = { title: 'Cases' };

export default async function Page({ searchParams }: Pick<GuildPageProps, 'searchParams'>) {
	const query = await searchParams;
	if (query.state === 'loading') return <CasesSkeleton />;

	await holdSkeleton(query);

	return <CasesScreen cases={mockCases} />;
}
