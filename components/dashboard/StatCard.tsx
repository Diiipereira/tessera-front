import { CircleAlert, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Stat, TrendDirection } from '@/lib/types/overview';
import { cn } from '@/lib/utils/cn';

const deltaIcons: Record<TrendDirection, LucideIcon> = {
	up: TrendingUp,
	down: TrendingDown,
	flat: CircleAlert
};

const deltaStyles: Record<TrendDirection, string> = {
	up: 'bg-success-subtle text-success-fg',
	down: 'bg-danger-subtle text-danger-fg',
	flat: 'bg-surface-sunken text-text-muted'
};

export function StatCard({ stat, icon: Icon }: { stat: Stat; icon: LucideIcon }) {
	const t = useTranslations('overview.stats');
	const DeltaIcon = deltaIcons[stat.direction];

	return (
		<div className="rounded-lg border border-border bg-surface p-5 shadow-1">
			<div className="mb-1 flex items-center gap-2">
				<Icon className="size-3.5 shrink-0 text-text-muted" aria-hidden="true" />
				<span className="min-w-0 truncate text-caption text-text-muted">{t(stat.id)}</span>
			</div>

			<p className="tabular text-h1">{stat.value}</p>

			<span
				className={cn(
					'mt-2 inline-flex h-5 items-center gap-1 rounded-sm px-2 text-caption',
					deltaStyles[stat.direction]
				)}
			>
				<DeltaIcon className="size-3 shrink-0" aria-hidden="true" />
				{stat.delta}
			</span>
		</div>
	);
}
