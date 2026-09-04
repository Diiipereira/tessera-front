'use client';

import { Blocks, SquareSlash, Ticket, Users, type LucideIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { BotStatusCard } from '@/components/dashboard/BotStatusCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { SetupBanner } from '@/components/dashboard/SetupBanner';
import { StatCard } from '@/components/dashboard/StatCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { BRAND } from '@/lib/brand';
import { guildHref } from '@/lib/navigation';
import {
	daysBefore,
	lastDays,
	netJoins,
	percentTrend,
	sumOf,
	toActivity,
	toChecklist,
	trendOf,
	type OverviewDto
} from '@/lib/overview';
import type { Guild } from '@/lib/types/guild';
import type { AuditEntry } from '@/lib/types/management';
import type { ActivityRange, Stat } from '@/lib/types/overview';
import { formatCount } from '@/lib/utils/format';

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

const WEEK = 7;

type OverviewScreenProps = {
	guild: Guild;
	overview: OverviewDto;
	audit: AuditEntry[];
	now: string;
};

export function OverviewScreen({ guild, overview, audit, now }: OverviewScreenProps) {
	const t = useTranslations('overview');
	const locale = useLocale();
	const [dismissed, setDismissed] = useState(false);
	const showSetup = !overview.setupCompleted && !dismissed;

	const activity = useMemo(() => {
		const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
		const dayMonth = new Intl.DateTimeFormat(locale, {
			day: 'numeric',
			month: 'short',
			timeZone: 'UTC'
		});

		return toActivity(overview.series, (day: string, range: ActivityRange) =>
			(range === '7d' ? weekday : dayMonth).format(new Date(`${day}T00:00:00.000Z`))
		);
	}, [overview.series, locale]);

	const week = lastDays(overview.series, WEEK);
	const before = daysBefore(overview.series, WEEK);

	const signed = useMemo(
		() => new Intl.NumberFormat(locale, { signDisplay: 'exceptZero' }),
		[locale]
	);

	const grew = netJoins(week);
	const commands = sumOf(week, 'commands');
	const commandTrend = percentTrend(commands, sumOf(before, 'commands'));

	const stats: Stat[] = [
		{
			id: 'members',
			value: formatCount(overview.memberCount),
			delta: t('stats.membersDelta', { count: grew, net: signed.format(grew) }),
			direction: trendOf(grew, 0).direction
		},
		{
			id: 'commands',
			value: formatCount(commands),
			delta:
				commandTrend === null
					? t('stats.noComparison')
					: t('stats.commandsDelta', {
							percent: `${signed.format(commandTrend.amount)}%`
						}),
			direction: commandTrend?.direction ?? 'flat'
		},
		{
			id: 'modules',
			value: t('stats.modulesValue', {
				enabled: overview.modules.enabled,
				total: overview.modules.total
			}),
			delta: t('stats.modulesDelta', { count: overview.modules.needingSetup }),
			direction: 'flat'
		},
		{
			id: 'tickets',
			value: formatCount(overview.openTickets),
			delta: t('stats.ticketsDelta', { count: sumOf(week, 'ticketsOpened') }),
			direction: 'flat'
		}
	];

	return (
		<div className="w-full p-6 sm:p-8">
			<div className="flex flex-col gap-6">
				{showSetup ? (
					<SetupBanner
						items={toChecklist(overview.checklist)}
						guildId={guild.id}
						onDismiss={() => {
							setDismissed(true);
						}}
					/>
				) : null}

				<div>
					<h1 className="text-h1">{t('title')}</h1>
					<p className="text-body text-text-muted">
						{t('lead', { brand: BRAND.name, guild: guild.name })}
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
					<BotStatusCard health={overview.bot} />
				</div>

				<div className="grid gap-4 lg:grid-cols-2">
					<ActivityFeed entries={audit} auditHref={guildHref(guild.id, '/audit')} now={now} />
					<QuickActions guildId={guild.id} />
				</div>
			</div>
		</div>
	);
}
