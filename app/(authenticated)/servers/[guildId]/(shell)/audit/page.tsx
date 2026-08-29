import { redirect } from 'next/navigation';
import { AuditSkeleton } from '@/components/skeletons/AuditSkeleton';
import { apiGet } from '@/lib/api';
import { ApiUnreachableError } from '@/lib/guild-access';
import type { AuditPage } from '@/lib/types/management';
import type { GuildPageProps } from '@/lib/types/page';
import { AuditScreen } from './AuditScreen';

export const metadata = { title: 'Audit log' };

type ModuleCatalog = { modules: { key: string }[] };

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);

	if (query.state === 'loading') return <AuditSkeleton />;

	const [result, catalog] = await Promise.all([
		apiGet<AuditPage>(`/guilds/${guildId}/audit`),
		apiGet<ModuleCatalog>('/modules')
	]);

	if (result.status === 'unauthenticated') redirect('/login');
	if (result.status === 'unreachable') {
		throw new ApiUnreachableError(result.reason, result.answered);
	}

	return (
		<AuditScreen
			guildId={guildId}
			entries={result.data.entries}
			nextCursor={result.data.nextCursor}
			moduleKeys={catalog.status === 'ok' ? catalog.data.modules.map((module) => module.key) : []}
			now={new Date().toISOString()}
		/>
	);
}
