'use client';

import { Gavel } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/management/PageHeader';
import { Avatar } from '@/components/layout/Avatar';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchInput } from '@/components/ui/SearchInput';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Select } from '@/components/ui/Select';
import { caseStatus, filterCases } from '@/lib/cases';
import { relativeTime } from '@/lib/time';
import type { CaseStatus, ModerationCase } from '@/lib/types/management';
import type { ModerationAction } from '@/lib/types/modules';
import { CaseDrawer } from './CaseDrawer';

const ACTION_VARIANTS: Record<ModerationAction, BadgeVariant> = {
	warn: 'warning',
	timeout: 'warning',
	mute: 'info',
	kick: 'danger',
	ban: 'danger'
};

const STATUS_VARIANTS: Record<CaseStatus, BadgeVariant> = {
	active: 'success',
	expired: 'neutral',
	revoked: 'outline'
};

const ACTIONS: ModerationAction[] = ['warn', 'timeout', 'mute', 'kick', 'ban'];

const STATUSES: CaseStatus[] = ['active', 'expired', 'revoked'];

export function CasesScreen({ cases }: { cases: ModerationCase[] }) {
	const t = useTranslations('cases');
	const [items, setItems] = useState(cases);
	const [query, setQuery] = useState('');
	const [action, setAction] = useState<ModerationAction | 'all'>('all');
	const [status, setStatus] = useState<CaseStatus | 'all'>('all');
	const [moderator, setModerator] = useState('all');
	const [selectedId, setSelectedId] = useState<string | null>(null);

	const moderators = useMemo(
		() =>
			[...new Set(items.map((entry) => entry.moderatorName))].sort((a, b) => a.localeCompare(b)),
		[items]
	);

	const visible = filterCases(items, { query, action, status, moderator });
	const selected = items.find((entry) => entry.id === selectedId) ?? null;
	const activeCount = items.filter((entry) => caseStatus(entry) === 'active').length;

	return (
		<div className="w-full p-6 sm:p-8">
			<PageHeader
				title={t('title')}
				description={t('description', { count: items.length, active: activeCount })}
			/>

			<div className="mt-6 flex flex-wrap items-center gap-3">
				<SearchInput
					value={query}
					onValueChange={setQuery}
					placeholder={t('search')}
					aria-label={t('searchLabel')}
					className="max-w-72"
				/>

				<Select
					options={[
						{ value: 'all', label: t('everyAction') },
						...ACTIONS.map((value) => ({ value, label: t(`action.`) }))
					]}
					value={action}
					onValueChange={(next) => {
						setAction(next as ModerationAction | 'all');
					}}
					className="w-40"
				/>

				<Select
					options={[
						{ value: 'all', label: t('everyModerator') },
						...moderators.map((name) => ({ value: name, label: name }))
					]}
					value={moderator}
					onValueChange={setModerator}
					className="w-44"
				/>

				<SegmentedControl
					options={[
						{ value: 'all', label: t('all') },
						...STATUSES.map((value) => ({ value, label: t(value) }))
					]}
					value={status}
					onValueChange={setStatus}
					label={t('status')}
					size="sm"
				/>
			</div>

			<div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface shadow-1">
				{visible.length === 0 ? (
					<EmptyState icon={Gavel} title={t('emptyTitle')} description={t('emptyBody')} />
				) : (
					<div className="overflow-x-auto">
						<table className="w-full min-w-200 border-collapse text-left">
							<thead>
								<tr className="border-b border-border text-overline text-text-muted uppercase">
									<th className="px-4 py-3 font-mono font-semibold">{t('columns.case')}</th>
									<th className="px-4 py-3 font-mono font-semibold">{t('columns.action')}</th>
									<th className="px-4 py-3 font-mono font-semibold">{t('columns.member')}</th>
									<th className="px-4 py-3 font-mono font-semibold">{t('columns.moderator')}</th>
									<th className="px-4 py-3 font-mono font-semibold">{t('columns.reason')}</th>
									<th className="px-4 py-3 font-mono font-semibold">{t('columns.opened')}</th>
									<th className="px-4 py-3 font-mono font-semibold">{t('columns.status')}</th>
								</tr>
							</thead>
							<tbody>
								{visible.map((entry) => {
									const entryStatus = caseStatus(entry);

									return (
										<tr
											key={entry.id}
											tabIndex={0}
											role="button"
											aria-label={t('open', { number: entry.number })}
											onClick={() => {
												setSelectedId(entry.id);
											}}
											onKeyDown={(event) => {
												if (event.key !== 'Enter' && event.key !== ' ') return;
												event.preventDefault();
												setSelectedId(entry.id);
											}}
											className="cursor-pointer border-b border-border transition-colors duration-120 ease-out last:border-0 hover:bg-surface-hover"
										>
											<td className="px-4 py-3 font-mono text-body-sm text-text-muted">
												#{entry.number}
											</td>
											<td className="px-4 py-3">
												<Badge variant={ACTION_VARIANTS[entry.action]}>
													{t(`action.${entry.action}`)}
												</Badge>
											</td>
											<td className="px-4 py-3">
												<div className="flex items-center gap-2">
													<Avatar
														initials={entry.targetInitials}
														color={entry.targetColor}
														shape="circle"
														size="sm"
													/>
													<span className="truncate text-body-sm">{entry.targetName}</span>
												</div>
											</td>
											<td className="px-4 py-3 text-body-sm text-text-muted">
												{entry.moderatorName}
											</td>
											<td className="max-w-80 px-4 py-3">
												<span className="block truncate text-body-sm text-text-muted">
													{entry.reason}
												</span>
											</td>
											<td className="px-4 py-3 text-body-sm whitespace-nowrap text-text-muted">
												{relativeTime(entry.createdAt)}
											</td>
											<td className="px-4 py-3">
												<Badge variant={STATUS_VARIANTS[entryStatus]} dot>
													{t(entryStatus)}
												</Badge>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
			</div>

			<p className="mt-3 text-caption font-normal text-text-muted">
				{t('showing', { shown: visible.length, total: items.length })}
			</p>

			<CaseDrawer
				key={selected?.id ?? 'none'}
				entry={selected}
				cases={items}
				onClose={() => {
					setSelectedId(null);
				}}
				onRevoke={(id) => {
					setItems((current) =>
						current.map((entry) => (entry.id === id ? { ...entry, revoked: true } : entry))
					);
				}}
				onEditReason={(id, reason) => {
					setItems((current) =>
						current.map((entry) => (entry.id === id ? { ...entry, reason } : entry))
					);
				}}
				onOpenCase={setSelectedId}
			/>
		</div>
	);
}
