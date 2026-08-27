'use client';

import { Gavel } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/management/PageHeader';
import { Avatar } from '@/components/layout/Avatar';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchInput } from '@/components/ui/SearchInput';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Select } from '@/components/ui/Select';
import { ACTION_LABELS, caseStatus, filterCases } from '@/lib/cases';
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

const STATUS_LABELS: Record<CaseStatus, string> = {
	active: 'Active',
	expired: 'Expired',
	revoked: 'Revoked'
};

export function CasesScreen({ cases }: { cases: ModerationCase[] }) {
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
				title="Cases"
				description={`${String(items.length)} cases on record, ${String(activeCount)} still in force. Every punishment opens one, wherever it came from.`}
			/>

			<div className="mt-6 flex flex-wrap items-center gap-3">
				<SearchInput
					value={query}
					onValueChange={setQuery}
					placeholder="Search member, reason or #number…"
					aria-label="Search cases"
					className="max-w-72"
				/>

				<Select
					options={[
						{ value: 'all', label: 'Every action' },
						{ value: 'warn', label: ACTION_LABELS.warn },
						{ value: 'timeout', label: ACTION_LABELS.timeout },
						{ value: 'mute', label: ACTION_LABELS.mute },
						{ value: 'kick', label: ACTION_LABELS.kick },
						{ value: 'ban', label: ACTION_LABELS.ban }
					]}
					value={action}
					onValueChange={(next) => {
						setAction(next as ModerationAction | 'all');
					}}
					className="w-40"
				/>

				<Select
					options={[
						{ value: 'all', label: 'Every moderator' },
						...moderators.map((name) => ({ value: name, label: name }))
					]}
					value={moderator}
					onValueChange={setModerator}
					className="w-44"
				/>

				<SegmentedControl
					options={[
						{ value: 'all', label: 'All' },
						{ value: 'active', label: 'Active' },
						{ value: 'expired', label: 'Expired' },
						{ value: 'revoked', label: 'Revoked' }
					]}
					value={status}
					onValueChange={setStatus}
					label="Filter by status"
					size="sm"
				/>
			</div>

			<div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface shadow-1">
				{visible.length === 0 ? (
					<EmptyState
						icon={Gavel}
						title="No cases match"
						description="Either nobody has been actioned under those filters, or the search is too narrow."
					/>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full min-w-200 border-collapse text-left">
							<thead>
								<tr className="border-b border-border text-overline text-text-muted uppercase">
									<th className="px-4 py-3 font-mono font-semibold">Case</th>
									<th className="px-4 py-3 font-mono font-semibold">Action</th>
									<th className="px-4 py-3 font-mono font-semibold">Member</th>
									<th className="px-4 py-3 font-mono font-semibold">Moderator</th>
									<th className="px-4 py-3 font-mono font-semibold">Reason</th>
									<th className="px-4 py-3 font-mono font-semibold">Opened</th>
									<th className="px-4 py-3 font-mono font-semibold">Status</th>
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
											aria-label={`Open case ${String(entry.number)}`}
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
													{ACTION_LABELS[entry.action]}
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
													{STATUS_LABELS[entryStatus]}
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
				Showing {visible.length} of {items.length} cases.
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
