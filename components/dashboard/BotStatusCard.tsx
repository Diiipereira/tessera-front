import { TriangleAlert } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { BRAND } from '@/lib/brand';
import type { BotHealth } from '@/lib/types/overview';

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-baseline justify-between gap-4">
			<span className="text-body-sm text-text-muted">{label}</span>
			<span className="tabular text-body">{value}</span>
		</div>
	);
}

export function BotStatusCard({ health }: { health: BotHealth }) {
	return (
		<div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-1">
			<div className="flex items-center gap-2">
				<h2 className="min-w-0 flex-1 truncate text-h4">{BRAND.name} status</h2>
				<Badge variant={health.online ? 'success' : 'danger'} dot>
					{health.online ? 'Online' : 'Offline'}
				</Badge>
			</div>

			<div className="flex flex-col gap-2.5">
				<Row label="Uptime" value={health.uptime} />
				<Row label="Latency" value={`${health.latencyMs.toString()} ms`} />
				<Row label="Shard" value={health.shard} />
			</div>

			{health.warnings.length > 0 ? (
				<div className="flex flex-col gap-2 border-t border-border pt-4">
					<span className="font-mono text-overline text-text-muted uppercase">
						Missing permissions
					</span>
					{health.warnings.map((warning) => (
						<p
							key={warning}
							className="flex items-start gap-2 text-body-sm text-pretty text-warning-fg"
						>
							<TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-warning" aria-hidden="true" />
							{warning}
						</p>
					))}
				</div>
			) : null}
		</div>
	);
}
