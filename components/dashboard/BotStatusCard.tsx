import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/Badge';
import { BRAND } from '@/lib/brand';
import { uptimeOf, type BotStatusDto } from '@/lib/overview';

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-baseline justify-between gap-4">
			<span className="text-body-sm text-text-muted">{label}</span>
			<span className="tabular text-body">{value}</span>
		</div>
	);
}

export function BotStatusCard({ health }: { health: BotStatusDto | null }) {
	const t = useTranslations('overview.status');
	const uptime = health === null ? null : uptimeOf(health.uptimeSeconds);

	const spoken =
		uptime === null
			? ''
			: uptime.days > 0
				? t('uptimeDays', { days: uptime.days, hours: uptime.hours })
				: uptime.hours > 0
					? t('uptimeHours', { hours: uptime.hours, minutes: uptime.minutes })
					: t('uptimeMinutes', { minutes: uptime.minutes });

	return (
		<div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-1">
			<div className="flex items-center gap-2">
				<h2 className="min-w-0 flex-1 truncate text-h4">{t('title', { brand: BRAND.name })}</h2>
				<Badge variant={health === null ? 'neutral' : health.online ? 'success' : 'danger'} dot>
					{health === null ? t('unknown') : health.online ? t('online') : t('offline')}
				</Badge>
			</div>

			{health === null ? (
				<p className="text-body-sm text-pretty text-text-muted">
					{t('neverReported', { brand: BRAND.name })}
				</p>
			) : (
				<div className="flex flex-col gap-2.5">
					<Row label={t('uptime')} value={spoken} />
					<Row label={t('latency')} value={t('latencyValue', { ms: health.latencyMs })} />
					<Row label={t('shard')} value={t('shardValue', { count: health.shards })} />
				</div>
			)}
		</div>
	);
}
