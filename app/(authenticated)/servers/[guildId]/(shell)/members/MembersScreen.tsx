'use client';

import { Users } from 'lucide-react';
import { useState } from 'react';
import { RoleChips } from '@/components/management/RoleChips';
import { PageHeader } from '@/components/management/PageHeader';
import { Avatar } from '@/components/layout/Avatar';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import {
	filterMembers,
	sortMembers,
	STANDING_LABELS,
	warningCount,
	type MemberSort
} from '@/lib/members';
import { BRAND } from '@/lib/brand';
import { relativeTime } from '@/lib/time';
import type { Role } from '@/lib/types/discord';
import type { Member, MemberStanding } from '@/lib/types/management';
import { formatCount } from '@/lib/utils/format';
import { MemberDrawer } from './MemberDrawer';

const STANDING_VARIANTS: Record<MemberStanding, BadgeVariant> = {
	clean: 'success',
	warned: 'warning',
	'timed-out': 'warning',
	banned: 'danger'
};

const SORTS: { value: MemberSort; label: string }[] = [
	{ value: 'joined', label: 'Newest first' },
	{ value: 'level', label: 'Highest level' },
	{ value: 'balance', label: 'Richest' },
	{ value: 'warnings', label: 'Most warnings' },
	{ value: 'name', label: 'Name A–Z' }
];

type MembersScreenProps = {
	members: Member[];
	roles: Role[];
	memberCount: number;
	currency: string;
};

export function MembersScreen({ members, roles, memberCount, currency }: MembersScreenProps) {
	const [query, setQuery] = useState('');
	const [roleId, setRoleId] = useState<string>('all');
	const [standing, setStanding] = useState<MemberStanding | 'all'>('all');
	const [sort, setSort] = useState<MemberSort>('joined');
	const [selectedId, setSelectedId] = useState<string | null>(null);

	const visible = sortMembers(filterMembers(members, { query, roleId, standing }), sort);
	const selected = members.find((member) => member.id === selectedId) ?? null;

	return (
		<div className="w-full p-6 sm:p-8">
			<PageHeader
				title="Members"
				description={`${formatCount(memberCount)} people in this server. The ${String(members.length)} listed here are the ones ${BRAND.name} has seen speak.`}
			/>

			<div className="mt-6 flex flex-wrap items-center gap-3">
				<SearchInput
					value={query}
					onValueChange={setQuery}
					placeholder="Search name, handle or ID…"
					aria-label="Search members"
					className="max-w-72"
				/>

				<Select
					options={[
						{ value: 'all', label: 'Every role' },
						...roles.map((role) => ({ value: role.id, label: role.name }))
					]}
					value={roleId}
					onValueChange={setRoleId}
					className="w-44"
				/>

				<Select
					options={[
						{ value: 'all', label: 'Any standing' },
						{ value: 'clean', label: STANDING_LABELS.clean },
						{ value: 'warned', label: STANDING_LABELS.warned },
						{ value: 'timed-out', label: STANDING_LABELS['timed-out'] },
						{ value: 'banned', label: STANDING_LABELS.banned }
					]}
					value={standing}
					onValueChange={(next) => {
						setStanding(next as MemberStanding | 'all');
					}}
					className="w-40"
				/>

				<Select
					options={SORTS.map((entry) => ({ value: entry.value, label: entry.label }))}
					value={sort}
					onValueChange={(next) => {
						setSort(next as MemberSort);
					}}
					className="ml-auto w-44"
				/>
			</div>

			<div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface shadow-1">
				{visible.length === 0 ? (
					<EmptyState
						icon={Users}
						title="Nobody matches"
						description="Try a shorter search, or clear the role and standing filters."
					/>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full min-w-200 border-collapse text-left">
							<thead>
								<tr className="border-b border-border text-overline text-text-muted uppercase">
									<th className="px-4 py-3 font-mono font-semibold">Member</th>
									<th className="px-4 py-3 font-mono font-semibold">Roles</th>
									<th className="px-4 py-3 font-mono font-semibold">Joined</th>
									<th className="px-4 py-3 text-right font-mono font-semibold">Level</th>
									<th className="px-4 py-3 text-right font-mono font-semibold">{currency}</th>
									<th className="px-4 py-3 text-right font-mono font-semibold">Warns</th>
									<th className="px-4 py-3 font-mono font-semibold">Standing</th>
								</tr>
							</thead>
							<tbody>
								{visible.map((member) => {
									const warnings = warningCount(member);

									return (
										<tr
											key={member.id}
											tabIndex={0}
											role="button"
											aria-label={`Open ${member.name}`}
											onClick={() => {
												setSelectedId(member.id);
											}}
											onKeyDown={(event) => {
												if (event.key !== 'Enter' && event.key !== ' ') return;
												event.preventDefault();
												setSelectedId(member.id);
											}}
											className="cursor-pointer border-b border-border transition-colors duration-120 ease-out last:border-0 hover:bg-surface-hover"
										>
											<td className="px-4 py-3">
												<div className="flex items-center gap-2.5">
													<Avatar
														initials={member.initials}
														color={member.color}
														shape="circle"
														size="sm"
													/>
													<div className="min-w-0">
														<p className="truncate text-body">{member.name}</p>
														<p className="truncate font-mono text-caption font-normal text-text-muted">
															{member.handle}
														</p>
													</div>
												</div>
											</td>
											<td className="px-4 py-3">
												<RoleChips roles={roles} roleIds={member.roleIds} />
											</td>
											<td className="px-4 py-3 text-body-sm whitespace-nowrap text-text-muted">
												{relativeTime(member.joinedAt)}
											</td>
											<td className="tabular px-4 py-3 text-right text-body-sm">{member.level}</td>
											<td className="tabular px-4 py-3 text-right text-body-sm">
												{formatCount(member.balance)}
											</td>
											<td className="tabular px-4 py-3 text-right text-body-sm">
												{warnings === 0 ? (
													<span className="text-text-muted">—</span>
												) : (
													<span className="text-warning-fg">{warnings}</span>
												)}
											</td>
											<td className="px-4 py-3">
												<Badge variant={STANDING_VARIANTS[member.standing]} dot>
													{STANDING_LABELS[member.standing]}
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
				Showing {visible.length} of {members.length} loaded members.
			</p>

			<MemberDrawer
				key={selected?.id ?? 'none'}
				member={selected}
				roles={roles}
				currency={currency}
				onClose={() => {
					setSelectedId(null);
				}}
			/>
		</div>
	);
}
