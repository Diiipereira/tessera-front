import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Avatar } from '@/components/layout/Avatar';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import type { GuildHref } from '@/lib/navigation';
import type { ActivityEntry, ActivitySource } from '@/lib/types/overview';

const sourceLabels: Record<ActivitySource, string> = {
	web: 'Web',
	slash: 'Slash',
	api: 'API'
};

const sourceVariants: Record<ActivitySource, BadgeVariant> = {
	web: 'primary',
	slash: 'neutral',
	api: 'info'
};

type ActivityFeedProps = {
	entries: ActivityEntry[];
	auditHref: GuildHref;
};

export function ActivityFeed({ entries, auditHref }: ActivityFeedProps) {
	const t = useTranslations('overview.feed');

	return (
		<div className="flex flex-col rounded-lg border border-border bg-surface shadow-1">
			<div className="flex items-center gap-3 border-b border-border p-5">
				<h2 className="min-w-0 flex-1 truncate text-h4">{t('title')}</h2>
				<Link
					href={auditHref}
					className="flex items-center gap-1 text-body-sm text-link no-underline hover:text-link-hover"
				>
					{t('audit')}
					<ArrowRight className="size-3.5" aria-hidden="true" />
				</Link>
			</div>

			<ul className="flex flex-col">
				{entries.map((entry) => (
					<li
						key={entry.id}
						className="flex items-start gap-3 border-b border-border p-4 last:border-0"
					>
						<Avatar
							initials={entry.actorInitials}
							color={entry.actorColor}
							shape="circle"
							size="sm"
							className="mt-0.5"
						/>
						<div className="min-w-0 flex-1">
							<p className="text-body-sm text-pretty text-text-muted">
								<span className="font-medium text-text">{entry.actorName}</span> {entry.action}{' '}
								<span className="font-medium text-text">{entry.target}</span>
							</p>
							<span className="text-caption font-normal text-text-muted">{entry.at}</span>
						</div>
						<Badge variant={sourceVariants[entry.source]} className="shrink-0">
							{sourceLabels[entry.source]}
						</Badge>
					</li>
				))}
			</ul>
		</div>
	);
}
