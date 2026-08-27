import { AuditSkeleton } from '@/components/skeletons/AuditSkeleton';
import { mockAudit } from '@/lib/mock';
import { holdSkeleton } from '@/lib/skeleton-hold';
import type { GuildPageProps } from '@/lib/types/page';
import { AuditScreen } from './AuditScreen';

export const metadata = { title: 'Audit log' };

export default async function Page({ searchParams }: Pick<GuildPageProps, 'searchParams'>) {
	const query = await searchParams;
	if (query.state === 'loading') return <AuditSkeleton />;

	await holdSkeleton(query);

	return <AuditScreen entries={mockAudit} />;
}
