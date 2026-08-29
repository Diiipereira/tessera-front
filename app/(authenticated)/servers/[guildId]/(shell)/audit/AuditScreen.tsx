'use client';

import { ChevronRight, Download, FileClock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Avatar } from '@/components/layout/Avatar';
import { PageHeader } from '@/components/management/PageHeader';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Select } from '@/components/ui/Select';
import {
	colorOf,
	diffKindOf,
	fieldKeyOf,
	fieldLabel,
	formatValue,
	initialsOf,
	toCsv
} from '@/lib/audit';
import { readAudit } from '@/lib/audit-client';
import { useRelativeTime } from '@/lib/hooks/useRelativeTime';
import { AUDIT_SOURCES, type AuditEntry, type AuditSource } from '@/lib/types/management';
import { cn } from '@/lib/utils/cn';

const SOURCE_VARIANTS: Record<AuditSource, BadgeVariant> = {
	web: 'primary',
	slash: 'neutral',
	api: 'info',
	system: 'neutral',
	import: 'neutral'
};

const KIND_STYLES = {
	added: { before: '', after: 'bg-success-subtle text-success-fg' },
	removed: { before: 'bg-danger-subtle text-danger-fg', after: '' },
	changed: {
		before: 'bg-danger-subtle text-danger-fg',
		after: 'bg-success-subtle text-success-fg'
	}
} as const;

export type AuditScreenProps = {
	guildId: string;
	entries: AuditEntry[];
	nextCursor: string | null;
	moduleKeys: string[];
	now: string;
};

export function AuditScreen({ guildId, entries, nextCursor, moduleKeys, now }: AuditScreenProps) {
	const t = useTranslations('audit');
	const relativeTime = useRelativeTime();
	const at = useMemo(() => new Date(now), [now]);

	const [loaded, setLoaded] = useState(entries);
	const [cursor, setCursor] = useState(nextCursor);
	const [moduleKey, setModuleKey] = useState('all');
	const [source, setSource] = useState<AuditSource | 'all'>('all');
	const [expanded, setExpanded] = useState<string | null>(null);
	const [pending, startTransition] = useTransition();

	const words = useMemo(
		() => ({
			none: t('value.none'),
			on: t('value.on'),
			off: t('value.off'),
			empty: t('value.empty'),
			emptyList: t('value.emptyList'),
			unreadable: t('value.unreadable')
		}),
		[t]
	);

	const moduleName = (key: string | null): string => {
		if (key === null) return t('value.none');

		return t.has(`modules.${key}`) ? t(`modules.${key}`) : key;
	};

	const fieldName = (entry: AuditEntry): string => {
		const field = fieldKeyOf(entry);

		if (field === '') return t('value.none');
		if (field === 'enabled') return t('fields.enabled');

		const key = `fields.${entry.moduleKey ?? ''}.${field}`;

		return t.has(key) ? t(key) : fieldLabel(field);
	};

	const load = (next: {
		moduleKey?: string;
		source?: AuditSource | 'all';
		append?: boolean;
	}): void => {
		const wantedModule = next.moduleKey ?? moduleKey;
		const wantedSource = next.source ?? source;

		startTransition(async () => {
			const result = await readAudit(guildId, {
				...(wantedModule === 'all' ? {} : { moduleKey: wantedModule }),
				...(wantedSource === 'all' ? {} : { source: wantedSource }),
				...(next.append === true && cursor !== null ? { cursor } : {})
			});

			if (result.status === 'error') {
				toast.error(t('failed'), { description: result.message });
				return;
			}

			setLoaded((current) =>
				next.append === true ? [...current, ...result.page.entries] : result.page.entries
			);
			setCursor(result.page.nextCursor);
			setExpanded(null);
		});
	};

	const exportCsv = (): void => {
		const csv = toCsv(
			loaded,
			{
				...words,
				at: t('at'),
				actor: t('actor'),
				module: t('module'),
				field: t('field'),
				source: t('source'),
				before: t('before'),
				after: t('after'),
				unknownActor: t('unknownActor')
			},
			(entry) => ({
				module: moduleName(entry.moduleKey),
				field: fieldName(entry),
				source: t(`sources.${entry.source}`)
			})
		);

		const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
		const link = document.createElement('a');

		link.href = url;
		link.download = `audit-${guildId}.csv`;
		link.click();
		URL.revokeObjectURL(url);

		toast.success(t('exported', { count: loaded.length }), { description: t('exportedHint') });
	};

	return (
		<div className="w-full p-6 sm:p-8">
			<PageHeader
				title={t('title')}
				description={t('description')}
				action={
					<Button variant="outline" disabled={loaded.length === 0} onClick={exportCsv}>
						<Download aria-hidden="true" />
						{t('export')}
					</Button>
				}
			/>

			<div className="mt-6 flex flex-wrap items-center gap-3">
				<Select
					options={[
						{ value: 'all', label: t('everyModule') },
						...moduleKeys.map((key) => ({ value: key, label: moduleName(key) }))
					]}
					value={moduleKey}
					onValueChange={(next) => {
						setModuleKey(next);
						load({ moduleKey: next });
					}}
					className="w-52"
					aria-label={t('module')}
				/>

				<SegmentedControl
					options={[
						{ value: 'all', label: t('allSources') },
						...AUDIT_SOURCES.map((entry) => ({ value: entry, label: t(`sources.${entry}`) }))
					]}
					value={source}
					onValueChange={(next) => {
						setSource(next);
						load({ source: next });
					}}
					label={t('source')}
					size="sm"
				/>
			</div>

			<div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface shadow-1">
				{loaded.length === 0 ? (
					<EmptyState icon={FileClock} title={t('emptyTitle')} description={t('emptyBody')} />
				) : (
					<ul>
						{loaded.map((entry) => {
							const open = expanded === entry.id;
							const kind = diffKindOf(entry);
							const name = entry.actor.name ?? t('unknownActor');

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
											initials={initialsOf(entry.actor.name, '?')}
											color={colorOf(entry.actor.id)}
											shape="circle"
											size="sm"
										/>

										<span className="min-w-0 flex-1">
											<span className="block truncate text-body">
												<span className="font-medium">{name}</span>{' '}
												<span className="text-text-muted">{fieldName(entry)}</span>
											</span>
											<span className="block truncate text-caption font-normal text-text-muted">
												{t('summary', {
													module: moduleName(entry.moduleKey),
													field: entry.path ?? ''
												})}
											</span>
										</span>

										<Badge variant={SOURCE_VARIANTS[entry.source]}>
											{t(`sources.${entry.source}`)}
										</Badge>

										<span className="tabular hidden w-32 shrink-0 text-right font-mono text-caption text-text-muted sm:block">
											{relativeTime(entry.at, at)}
										</span>
									</button>

									{open ? (
										<div className="border-t border-border bg-surface-sunken p-4 sm:pl-11">
											<div className="overflow-x-auto">
												<table className="w-full min-w-140 border-collapse text-left">
													<thead>
														<tr className="text-overline text-text-muted uppercase">
															<th className="w-1/4 pb-2 font-mono font-semibold">{t('field')}</th>
															<th className="pb-2 font-mono font-semibold">{t('before')}</th>
															<th className="pb-2 font-mono font-semibold">{t('after')}</th>
														</tr>
													</thead>
													<tbody>
														<tr className="align-top">
															<td className="py-1.5 pr-4 text-body-sm">{fieldName(entry)}</td>
															<td className="py-1.5 pr-4">
																<code
																	className={cn(
																		'inline-block rounded-sm px-1.5 py-0.5 font-mono text-caption break-all',
																		KIND_STYLES[kind].before
																	)}
																>
																	{formatValue(entry.before, words)}
																</code>
															</td>
															<td className="py-1.5">
																<code
																	className={cn(
																		'inline-block rounded-sm px-1.5 py-0.5 font-mono text-caption break-all',
																		KIND_STYLES[kind].after
																	)}
																>
																	{formatValue(entry.after, words)}
																</code>
															</td>
														</tr>
													</tbody>
												</table>
											</div>

											{entry.actor.id === null ? (
												<p className="mt-3 text-caption font-normal text-text-muted">
													{t('unknownActorHint')}
												</p>
											) : null}

											<p className="mt-3 font-mono text-caption text-text-muted">{entry.at}</p>
										</div>
									) : null}
								</li>
							);
						})}
					</ul>
				)}
			</div>

			<div className="mt-3 flex flex-wrap items-center gap-3">
				<p className="text-caption font-normal text-text-muted">
					{cursor === null ? t('allLoaded') : t('loaded', { count: loaded.length })}
				</p>

				{cursor === null ? null : (
					<Button
						variant="ghost"
						size="sm"
						disabled={pending}
						onClick={() => {
							load({ append: true });
						}}
					>
						{pending ? t('loading') : t('loadMore')}
					</Button>
				)}
			</div>
		</div>
	);
}
