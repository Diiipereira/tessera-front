import { Suspense } from 'react';
import { resolveGuild } from '@/lib/guild-access';
import { mockModules } from '@/lib/mock';
import { holdSkeleton } from '@/lib/skeleton-hold';
import type { GuildPageProps } from '@/lib/types/page';
import { ModulesScreen } from './ModulesScreen';
import { ModulesSkeleton } from '@/components/skeletons/ModulesSkeleton';

export const metadata = { title: 'Modules' };

export default function Page({ params, searchParams }: GuildPageProps) {
	return (
		<Suspense fallback={<ModulesSkeleton />}>
			<Modules params={params} searchParams={searchParams} />
		</Suspense>
	);
}

async function Modules({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);
	const guild = await resolveGuild(guildId);

	if (query.state === 'loading') return <ModulesSkeleton />;

	await holdSkeleton(query);

	return (
		<ModulesScreen modules={mockModules} guildId={guild.id} planIsPaid={guild.tier !== 'free'} />
	);
}
