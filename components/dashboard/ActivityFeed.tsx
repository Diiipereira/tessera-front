'use client';

import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Avatar } from '@/components/layout/Avatar';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { colorOf, fieldKeyOf, fieldLabel, initialsOf } from '@/lib/audit';
import { useRelativeTime } from '@/lib/hooks/useRelativeTime';
import type { GuildHref } from '@/lib/navigation';
import type { AuditEntry, AuditSource } from '@/lib/types/management';

const sourceVariants: Record<AuditSource, BadgeVariant> = {
	web: 'primary',
	slash: 'neutral',
	api: 'info',
	system: 'neutral',
	import: 'neutral'
};

type ActivityFeedProps = {
	entries: AuditEntry[];
	auditHref: GuildHref;
	now: string;
};

export function ActivityFeed({ entries, auditHref, now }: ActivityFeedProps) {
	const t = useTranslations('overview.feed');
	const audit = useTranslations('audit');
	const relativeTime = useRelativeTime();
	const at = new Date(now);

	const moduleLabel = (key: string | null): string => {
		if (key === null) return audit('value.none');

		return audit.has(`modules.${key}`) ? audit(`modules.${key}`) : key;
	};

	const fieldName = (entry: AuditEntry): string => {
		const field = fieldKeyOf(entry);

		if (field === '') return audit('value.none');
		if (field === 'enabled') return audit('fields.enabled');

		const key = `fields.${entry.moduleKey ?? ''}.${field}`;

		return audit.has(key) ? audit(key) : fieldLabel(field);
	};

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

			{entries.length === 0 ? (
				<p className="p-5 text-body-sm text-pretty text-text-muted">{t('empty')}</p>
			) : (
				<ul className="flex flex-col">
					{entries.map((entry) => (
						<li
							key={entry.id}
							className="flex items-start gap-3 border-b border-border p-4 last:border-0"
						>
							<Avatar
								initials={initialsOf(entry.actor.name, '?')}
								color={colorOf(entry.actor.id)}
								shape="circle"
								size="sm"
								className="mt-0.5"
							/>
							<div className="min-w-0 flex-1">
								<p className="text-body-sm text-pretty text-text-muted">
									<span className="font-medium text-text">
										{entry.actor.name ?? audit('unknownActor')}
									</span>{' '}
									{audit('summary', {
										module: moduleLabel(entry.moduleKey),
										field: fieldName(entry)
									})}
								</p>
								<span className="text-caption font-normal text-text-muted">
									{relativeTime(entry.at, at)}
								</span>
							</div>
							<Badge variant={sourceVariants[entry.source]}>
								{audit(`sources.${entry.source}`)}
							</Badge>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
