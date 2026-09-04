import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { OverviewSkeleton } from '@/components/skeletons/OverviewSkeleton';
import { apiGet, type ApiResult } from '@/lib/api';
import { ApiUnreachableError, lookupGuild, resolveGuild } from '@/lib/guild-access';
import type { OverviewDto } from '@/lib/overview';
import type { AuditPage } from '@/lib/types/management';
import type { GuildPageProps } from '@/lib/types/page';
import { redirect } from 'next/navigation';
import { OverviewScreen } from './OverviewScreen';

const FEED_SHOWN = 5;

export async function generateMetadata({ params }: Pick<GuildPageProps, 'params'>) {
	const { guildId } = await params;
	const [guild, t] = await Promise.all([lookupGuild(guildId), getTranslations('overview')]);

	return { title: t('metaTitle', { guild: guild?.name ?? t('fallbackGuild') }) };
}

function unwrap<T>(result: ApiResult<T>): T {
	if (result.status === 'unauthenticated') redirect('/login');
	if (result.status === 'unreachable') {
		throw new ApiUnreachableError(result.reason, result.answered, result.code ?? null);
	}

	return result.data;
}

export default function Page({ params, searchParams }: GuildPageProps) {
	return (
		<Suspense
			fallback={
				<div className="w-full p-6 sm:p-8">
					<OverviewSkeleton />
				</div>
			}
		>
			<Overview params={params} searchParams={searchParams} />
		</Suspense>
	);
}

async function Overview({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);

	if (query.state === 'loading') {
		return (
			<div className="w-full p-6 sm:p-8">
				<OverviewSkeleton />
			</div>
		);
	}

	const [guild, overview, audit] = await Promise.all([
		resolveGuild(guildId),
		apiGet<OverviewDto>(`/guilds/${guildId}/overview`),
		apiGet<AuditPage>(`/guilds/${guildId}/audit?limit=${String(FEED_SHOWN)}`)
	]);

	return (
		<OverviewScreen
			guild={guild}
			overview={unwrap(overview)}
			audit={unwrap(audit).entries}
			now={new Date().toISOString()}
		/>
	);
}
