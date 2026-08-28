'use client';

import { ChevronRight, Download, FileClock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/management/PageHeader';
import { Avatar } from '@/components/layout/Avatar';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchInput } from '@/components/ui/SearchInput';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Select } from '@/components/ui/Select';
import { diffEntry, fieldLabel, filterAudit, SOURCE_LABELS, toCsv } from '@/lib/audit';
import { absoluteTime, relativeTime } from '@/lib/time';
import type { AuditEntry, AuditSource } from '@/lib/types/management';
import { cn } from '@/lib/utils/cn';

const SOURCE_VARIANTS: Record<AuditSource, BadgeVariant> = {
	web: 'primary',
	slash: 'neutral',
	api: 'info'
};

const KIND_STYLES = {
	added: { before: '', after: 'bg-success-subtle text-success-fg' },
	removed: { before: 'bg-danger-subtle text-danger-fg', after: '' },
	changed: {
		before: 'bg-danger-subtle text-danger-fg',
		after: 'bg-success-subtle text-success-fg'
	}
} as const;

export function AuditScreen({ entries }: { entries: AuditEntry[] }) {
	const [query, setQuery] = useState('');
	const [actor, setActor] = useState('all');
	const [module, setModule] = useState('all');
	const [source, setSource] = useState<AuditSource | 'all'>('all');
	const [expanded, setExpanded] = useState<string | null>(null);

	const actors = useMemo(
		() => [...new Set(entries.map((entry) => entry.actorName))].sort((a, b) => a.localeCompare(b)),
		[entries]
	);
	const modules = useMemo(
		() => [...new Set(entries.map((entry) => entry.module))].sort((a, b) => a.localeCompare(b)),
		[entries]
	);

	const visible = filterAudit(entries, { query, actor, module, source });

	return (
		<div className="w-full p-6 sm:p-8">
			<PageHeader
				title="Audit log"
				description="Every change to this server, whoever made it and wherever they made it from."
				action={
					<Button
						variant="outline"
						onClick={() => {
							toast.success(`Exported ${String(visible.length)} entries`, {
								description: `${String(toCsv(visible).length)} bytes of CSV, once the API can stream it.`
							});
						}}
					>
						<Download aria-hidden="true" />
						Export
					</Button>
				}
			/>

			<div className="mt-6 flex flex-wrap items-center gap-3">
				<SearchInput
					value={query}
					onValueChange={setQuery}
					placeholder="Search actions and fields…"
					aria-label="Search the audit log"
					className="max-w-72"
				/>

				<Select
					options={[
						{ value: 'all', label: 'Every actor' },
						...actors.map((name) => ({ value: name, label: name }))
					]}
					value={actor}
					onValueChange={setActor}
					className="w-44"
				/>

				<Select
					options={[
						{ value: 'all', label: 'Every module' },
						...modules.map((name) => ({ value: name, label: name }))
					]}
					value={module}
					onValueChange={setModule}
					className="w-44"
				/>

				<SegmentedControl
					options={[
						{ value: 'all', label: 'All' },
						{ value: 'web', label: 'Web' },
						{ value: 'slash', label: 'Slash' },
						{ value: 'api', label: 'API' }
					]}
					value={source}
					onValueChange={setSource}
					label="Filter by source"
					size="sm"
				/>
			</div>

			<div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface shadow-1">
				{visible.length === 0 ? (
					<EmptyState
						icon={FileClock}
						title="Nothing matches"
						description="No change in the retained window fits those filters. The free plan keeps 30 days."
					/>
				) : (
					<ul>
						{visible.map((entry) => {
							const rows = diffEntry(entry);
							const open = expanded === entry.id;

							return (
								<li key={entry.id} className="border-b border-border last:border-0">
									<button
										type="button"
										aria-expanded={open}
										onClick={() => {
											setExpanded(open ? null : entry.id);
										}}
										className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-120 ease-out hover:bg-surface-hover"
									>
										<ChevronRight
											className={cn(
												'size-4 shrink-0 text-text-subtle transition-transform duration-120 ease-out',
												open && 'rotate-90'
											)}
											aria-hidden="true"
										/>
										<Avatar
											initials={entry.actorInitials}
											color={entry.actorColor}
											shape="circle"
											size="sm"
										/>

										<span className="min-w-0 flex-1">
											<span className="block truncate text-body">
												<span className="font-medium">{entry.actorName}</span>{' '}
												<span className="text-text-muted">{entry.action}</span>
											</span>
											<span className="block truncate text-caption font-normal text-text-muted">
												{entry.module} · {rows.length} {rows.length === 1 ? 'field' : 'fields'}{' '}
												changed
											</span>
										</span>

										<Badge variant={SOURCE_VARIANTS[entry.source]}>
											{SOURCE_LABELS[entry.source]}
										</Badge>

										<span
											className="tabular hidden w-32 shrink-0 text-right font-mono text-caption text-text-muted sm:block"
											title={absoluteTime(entry.at)}
										>
											{relativeTime(entry.at)}
										</span>
									</button>

									{open ? (
										<div className="border-t border-border bg-surface-sunken p-4 sm:pl-11">
											{rows.length === 0 ? (
												<p className="text-body-sm text-text-muted">
													Nothing was written — the values sent matched what was already stored.
												</p>
											) : (
												<div className="overflow-x-auto">
													<table className="w-full min-w-140 border-collapse text-left">
														<thead>
															<tr className="text-overline text-text-muted uppercase">
																<th className="w-1/4 pb-2 font-mono font-semibold">Field</th>
																<th className="pb-2 font-mono font-semibold">Before</th>
																<th className="pb-2 font-mono font-semibold">After</th>
															</tr>
														</thead>
														<tbody>
															{rows.map((row) => (
																<tr key={row.field} className="align-top">
																	<td className="py-1.5 pr-4 text-body-sm">
																		{fieldLabel(row.field)}
																	</td>
																	<td className="py-1.5 pr-4">
																		{row.before === null ? (
																			<span className="text-body-sm text-text-muted">—</span>
																		) : (
																			<code
																				className={cn(
																					'inline-block rounded-sm px-1.5 py-0.5 font-mono text-caption break-all',
																					KIND_STYLES[row.kind].before
																				)}
																			>
																				{row.before}
																			</code>
																		)}
																	</td>
																	<td className="py-1.5">
																		{row.after === null ? (
																			<span className="text-body-sm text-text-muted">—</span>
																		) : (
																			<code
																				className={cn(
																					'inline-block rounded-sm px-1.5 py-0.5 font-mono text-caption break-all',
																					KIND_STYLES[row.kind].after
																				)}
																			>
																				{row.after}
																			</code>
																		)}
																	</td>
																</tr>
															))}
														</tbody>
													</table>
												</div>
											)}

											<p className="mt-3 font-mono text-caption text-text-muted">
												{absoluteTime(entry.at)} UTC
											</p>
										</div>
									) : null}
								</li>
							);
						})}
					</ul>
				)}
			</div>

			<p className="mt-3 text-caption font-normal text-text-muted">
				Showing {visible.length} of {entries.length} retained entries.
			</p>
		</div>
	);
}
