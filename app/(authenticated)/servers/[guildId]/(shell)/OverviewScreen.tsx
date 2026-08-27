'use client';

import { Blocks, SquareSlash, Ticket, Users, type LucideIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { BotStatusCard } from '@/components/dashboard/BotStatusCard';
import { OverviewSkeleton } from '@/components/skeletons/OverviewSkeleton';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { SetupBanner } from '@/components/dashboard/SetupBanner';
import { StatCard } from '@/components/dashboard/StatCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { BRAND } from '@/lib/brand';
import { guildHref } from '@/lib/navigation';
import type { Guild } from '@/lib/types/guild';
import type {
	ActivityEntry,
	ActivityPoint,
	ActivityRange,
	BotHealth,
	SetupChecklistItem,
	Stat
} from '@/lib/types/overview';

const ActivityChart = dynamic(
	() => import('@/components/dashboard/ActivityChart').then((module) => module.ActivityChart),
	{
		ssr: false,
		loading: () => (
			<div className="rounded-lg border border-border bg-surface shadow-1">
				<div className="flex items-center gap-3 border-b border-border p-5">
					<div className="flex-1">
						<Skeleton className="h-6 w-24" />
						<Skeleton className="mt-1.5 h-4 w-64 max-w-full" />
					</div>
					<Skeleton className="h-8 w-32 rounded-md" />
				</div>
				<div className="p-5">
					<Skeleton className="h-64 w-full rounded-md" />
				</div>
			</div>
		)
	}
);

const statIcons: Record<string, LucideIcon> = {
	members: Users,
	commands: SquareSlash,
	modules: Blocks,
	tickets: Ticket
};

type OverviewScreenProps = {
	guild: Guild;
	stats: Stat[];
	activity: Record<ActivityRange, ActivityPoint[]>;
	health: BotHealth;
	recent: ActivityEntry[];
	checklist: SetupChecklistItem[];
	setupCompleted: boolean;
	loading: boolean;
};

export function OverviewScreen({
	guild,
	stats,
	activity,
	health,
	recent,
	checklist,
	setupCompleted,
	loading
}: OverviewScreenProps) {
	const [dismissed, setDismissed] = useState(false);
	const showSetup = !setupCompleted && !dismissed;

	return (
		<div className="w-full p-6 sm:p-8">
			{loading ? (
				<OverviewSkeleton />
			) : (
				<div className="flex flex-col gap-6">
					{showSetup ? (
						<SetupBanner
							items={checklist}
							guildId={guild.id}
							onDismiss={() => {
								setDismissed(true);
							}}
						/>
					) : null}

					<div>
						<h1 className="text-h1">Overview</h1>
						<p className="text-body text-text-muted">
							What {BRAND.name} has been doing in {guild.name} this week.
						</p>
					</div>

					<div className="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-4">
						{stats.map((stat) => (
							<StatCard key={stat.id} stat={stat} icon={statIcons[stat.id] ?? Blocks} />
						))}
					</div>

					<div className="grid gap-4 xl:grid-cols-3">
						<div className="min-w-0 xl:col-span-2">
							<ActivityChart data={activity} />
						</div>
						<BotStatusCard health={health} />
					</div>

					<div className="grid gap-4 lg:grid-cols-2">
						<ActivityFeed entries={recent} auditHref={guildHref(guild.id, '/audit')} />
						<QuickActions guildId={guild.id} />
					</div>
				</div>
			)}
		</div>
	);
}
