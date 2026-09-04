'use client';

import { SquareSlash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/management/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchInput } from '@/components/ui/SearchInput';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Select } from '@/components/ui/Select';
import {
	DEFAULT_USAGE_WINDOW,
	USAGE_WINDOWS,
	blankCommandFilters,
	byUses,
	filterCommands,
	modulesIn,
	totalUses,
	usedCount,
	type CommandDto,
	type CommandFilters,
	type CommandReportDto,
	type UsageWindow
} from '@/lib/command-report';
import { loadCommands } from '@/lib/commands-client';
import { useRelativeTime } from '@/lib/hooks/useRelativeTime';
import { formatCount } from '@/lib/utils/format';
import { CommandDrawer } from './CommandDrawer';

type CommandsScreenProps = {
	guildId: string;
	report: CommandReportDto;
	now: string;
};

export function CommandsScreen({ guildId, report, now }: CommandsScreenProps) {
	const t = useTranslations('commands');
	const moduleNames = useTranslations('nav');
	const relativeTime = useRelativeTime();
	const at = new Date(now);

	const [days, setDays] = useState<UsageWindow>(DEFAULT_USAGE_WINDOW);
	const [loaded, setLoaded] = useState(report);
	const [filters, setFilters] = useState<CommandFilters>(blankCommandFilters);
	const [open, setOpen] = useState<CommandDto | null>(null);
	const first = useRef(true);

	useEffect(() => {
		if (first.current) {
			first.current = false;

			return;
		}

		let dropped = false;

		void loadCommands(guildId, days).then((result) => {
			if (dropped) return;

			if (result.status === 'error') {
				toast.error(t('loadFailed'), { description: result.message });

				return;
			}

			setLoaded(result.report);
		});

		return () => {
			dropped = true;
		};
	}, [guildId, days, t]);

	const commands = loaded.commands;
	const visible = [...filterCommands(commands, filters)].sort(byUses);
	const modules = modulesIn(commands);

	const moduleLabel = (key: string): string => (moduleNames.has(key) ? moduleNames(key) : key);

	return (
		<div className="w-full p-6 sm:p-8">
			<PageHeader
				title={t('title')}
				description={t('description', {
					used: usedCount(commands),
					total: commands.length,
					runs: formatCount(totalUses(commands))
				})}
			/>

			<div className="mt-6 flex flex-wrap items-center gap-3">
				<SearchInput
					value={filters.query}
					onValueChange={(next) => {
						setFilters((current) => ({ ...current, query: next }));
					}}
					placeholder={t('search')}
					aria-label={t('searchLabel')}
					className="max-w-72"
				/>

				<Select
					options={[
						{ value: 'all', label: t('everyModule') },
						...modules.map((value) => ({ value, label: moduleLabel(value) }))
					]}
					value={filters.module}
					onValueChange={(next) => {
						setFilters((current) => ({ ...current, module: next }));
					}}
					className="w-44"
				/>

				<Checkbox
					checked={filters.onlyUsed}
					onCheckedChange={(next) => {
						setFilters((current) => ({ ...current, onlyUsed: next === true }));
					}}
					label={t('onlyUsed')}
				/>

				<SegmentedControl
					options={USAGE_WINDOWS.map((value) => ({
						value: String(value),
						label: t('window', { days: value })
					}))}
					value={String(days)}
					onValueChange={(next) => {
						setDays(Number(next) as UsageWindow);
					}}
					label={t('windowLabel')}
					size="sm"
					className="ml-auto"
				/>
			</div>

			<p className="mt-3 text-caption font-normal text-text-muted">{t('permissionsNote')}</p>

			<div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface shadow-1">
				{visible.length === 0 ? (
					<EmptyState icon={SquareSlash} title={t('emptyTitle')} description={t('emptyBody')} />
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left text-body-sm">
							<thead className="border-b border-border text-caption text-text-muted">
								<tr>
									<th className="px-4 py-3 font-mono font-semibold">{t('columns.command')}</th>
									<th className="px-4 py-3 font-mono font-semibold">{t('columns.module')}</th>
									<th className="px-4 py-3 text-right font-mono font-semibold">
										{t('columns.uses')}
									</th>
									<th className="px-4 py-3 text-right font-mono font-semibold">
										{t('columns.failures')}
									</th>
									<th className="px-4 py-3 font-mono font-semibold">{t('columns.lastUsed')}</th>
								</tr>
							</thead>
							<tbody>
								{visible.map((command) => (
									<tr key={command.name} className="border-b border-border last:border-0">
										<td className="px-4 py-3">
											<button
												type="button"
												className="font-mono text-body-sm text-link hover:text-link-hover"
												onClick={() => {
													setOpen(command);
												}}
											>
												/{command.name}
											</button>
											{command.subcommands.length === 0 ? null : (
												<span className="ml-2 text-caption font-normal text-text-muted">
													{t('subcommandCount', { count: command.subcommands.length })}
												</span>
											)}
										</td>
										<td className="px-4 py-3 text-text-muted">
											{command.module === null ? (
												<span className="text-text-muted">{t('noModule')}</span>
											) : (
												<Badge variant="neutral">{moduleLabel(command.module)}</Badge>
											)}
										</td>
										<td className="tabular px-4 py-3 text-right">{formatCount(command.uses)}</td>
										<td className="tabular px-4 py-3 text-right">
											{command.failures === 0 ? (
												<span className="text-text-muted">—</span>
											) : (
												<span className="text-warning-fg">{formatCount(command.failures)}</span>
											)}
										</td>
										<td className="px-4 py-3 text-text-muted">
											{command.lastUsedAt === null
												? t('neverUsed')
												: relativeTime(command.lastUsedAt, at)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			<CommandDrawer
				command={open}
				since={loaded.since}
				now={now}
				onClose={() => {
					setOpen(null);
				}}
			/>
		</div>
	);
}
