import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Crown } from 'lucide-react';
import { Meter } from '@/components/ui/Meter';
import { guildHref } from '@/lib/navigation';
import type { Plan } from '@/lib/types/billing';
import { cn } from '@/lib/utils/cn';

type PlanCardProps = {
	plan: Plan;
	guildId: string;
	collapsible?: boolean;
};

export function PlanCard({ plan, guildId, collapsible = false }: PlanCardProps) {
	const t = useTranslations('shell');

	return (
		<div
			className={cn(
				'rounded-lg border border-border bg-surface p-3',
				collapsible && 'sidebar-collapsed:hidden'
			)}
		>
			<div className="mb-2 flex items-center gap-2">
				<Crown className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
				<span className="min-w-0 flex-1 truncate text-body-sm font-medium">{plan.name}</span>
				<Link
					href={guildHref(guildId, '/billing')}
					className="text-caption text-link hover:text-link-hover"
				>
					{t('managePlan')}
				</Link>
			</div>
			<Meter
				label={plan.usage.label}
				valueLabel={`${String(plan.usage.value)} / ${String(plan.usage.max)}`}
				value={plan.usage.value}
				max={plan.usage.max}
			/>
		</div>
	);
}
