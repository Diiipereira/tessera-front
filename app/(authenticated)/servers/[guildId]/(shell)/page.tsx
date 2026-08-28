import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { OverviewSkeleton } from '@/components/skeletons/OverviewSkeleton';
import { lookupGuild, resolveGuild } from '@/lib/guild-access';
import {
	mockActivity,
	mockBotHealth,
	mockRecentActivity,
	mockSetupChecklist,
	mockStats
} from '@/lib/mock';
import { holdSkeleton } from '@/lib/skeleton-hold';
import type { GuildPageProps } from '@/lib/types/page';
import { OverviewScreen } from './OverviewScreen';

export async function generateMetadata({ params }: Pick<GuildPageProps, 'params'>) {
	const { guildId } = await params;
	const [guild, t] = await Promise.all([lookupGuild(guildId), getTranslations('overview')]);

	return { title: t('metaTitle', { guild: guild?.name ?? t('fallbackGuild') }) };
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
	const guild = await resolveGuild(guildId);

	await holdSkeleton(query);

	return (
		<OverviewScreen
			guild={guild}
			stats={mockStats}
			activity={mockActivity}
			health={mockBotHealth}
			recent={mockRecentActivity}
			checklist={mockSetupChecklist}
			setupCompleted={query.setup !== 'pending'}
			loading={query.state === 'loading'}
		/>
	);
}
