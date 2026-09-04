'use client';

import { useTranslations } from 'next-intl';
import { Drawer } from '@/components/ui/Drawer';
import { failureRate, type CommandDto } from '@/lib/command-report';
import { useRelativeTime } from '@/lib/hooks/useRelativeTime';
import { absoluteTime } from '@/lib/time';
import { formatCount } from '@/lib/utils/format';

type CommandDrawerProps = {
	command: CommandDto | null;
	since: string;
	now: string;
	onClose: () => void;
};

export function CommandDrawer({ command, since, now, onClose }: CommandDrawerProps) {
	const t = useTranslations('commands.drawer');
	const relativeTime = useRelativeTime();
	const at = new Date(now);

	if (command === null) return null;

	const rate = failureRate(command);

	return (
		<Drawer
			open
			onOpenChange={(next) => {
				if (!next) onClose();
			}}
			title={`/${command.name}`}
			header={
				<div className="min-w-0">
					<p className="truncate font-mono text-h4">/{command.name}</p>
					<p className="text-caption font-normal text-text-muted">
						{t('since', { date: absoluteTime(since) })}
					</p>
				</div>
			}
		>
			<div className="flex flex-col gap-5">
				<dl className="grid grid-cols-3 gap-3">
					<Stat label={t('uses')} value={formatCount(command.uses)} />
					<Stat label={t('failures')} value={formatCount(command.failures)} />
					<Stat label={t('failureRate')} value={rate === null ? '—' : `${String(rate)}%`} />
				</dl>

				<Row
					label={t('lastUsed')}
					value={
						command.lastUsedAt === null
							? t('neverUsed')
							: `${relativeTime(command.lastUsedAt, at)} · ${absoluteTime(command.lastUsedAt)}`
					}
				/>

				{command.subcommands.length === 0 ? (
					<p className="text-body-sm text-pretty text-text-muted">{t('noSubcommands')}</p>
				) : (
					<div className="flex flex-col gap-2">
						<span className="font-mono text-overline text-text-muted uppercase">
							{t('subcommands')}
						</span>
						<ul className="flex flex-col gap-2">
							{command.subcommands.map((one) => (
								<li
									key={one.name}
									className="flex items-baseline gap-3 rounded-md border border-border bg-surface-sunken p-3"
								>
									<span className="min-w-0 flex-1 truncate font-mono text-body-sm">
										/{command.name} {one.name}
									</span>
									<span className="tabular text-body-sm">{t('runs', { count: one.uses })}</span>
									{one.failures === 0 ? null : (
										<span className="tabular text-caption text-warning-fg">
											{t('failed', { count: one.failures })}
										</span>
									)}
								</li>
							))}
						</ul>
					</div>
				)}

				<p className="text-body-sm text-pretty text-text-muted">{t('failureMeaning')}</p>
				<p className="text-body-sm text-pretty text-text-muted">{t('permissions')}</p>
			</div>
		</Drawer>
	);
}

function Stat({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-md border border-border bg-surface-sunken px-3 py-2">
			<dt className="font-mono text-overline text-text-muted uppercase">{label}</dt>
			<dd className="tabular text-h4">{value}</dd>
		</div>
	);
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-baseline justify-between gap-4 border-b border-border pb-2">
			<span className="text-body-sm text-text-muted">{label}</span>
			<span className="text-right text-body-sm">{value}</span>
		</div>
	);
}
