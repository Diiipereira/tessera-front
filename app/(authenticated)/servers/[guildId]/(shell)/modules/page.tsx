import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { ModulesSkeleton } from '@/components/skeletons/ModulesSkeleton';
import { apiGet } from '@/lib/api';
import type { GuildModuleListDto } from '@/lib/api-url';
import { ApiUnreachableError, resolveGuild } from '@/lib/guild-access';
import { toModuleSummaries, type ModuleCatalogDto } from '@/lib/modules/catalog';
import type { GuildPageProps } from '@/lib/types/page';
import { ModulesScreen } from './ModulesScreen';

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

	const [catalog, states] = await Promise.all([
		apiGet<ModuleCatalogDto>('/modules'),
		apiGet<GuildModuleListDto>(`/guilds/${guildId}/modules`)
	]);

	if (catalog.status === 'unauthenticated' || states.status === 'unauthenticated')
		redirect('/login');

	if (catalog.status === 'unreachable')
		throw new ApiUnreachableError(catalog.reason, catalog.answered, catalog.code ?? null);

	if (states.status === 'unreachable')
		throw new ApiUnreachableError(states.reason, states.answered, states.code ?? null);

	return (
		<ModulesScreen
			modules={toModuleSummaries(catalog.data, states.data.modules)}
			guildId={guild.id}
		/>
	);
}
