'use client';

import { Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { RoleChips } from '@/components/management/RoleChips';
import { PageHeader } from '@/components/management/PageHeader';
import { Avatar } from '@/components/layout/Avatar';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { filterMembers, sortMembers, warningCount, type MemberSort } from '@/lib/members';
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

const SORTS: MemberSort[] = ['joined', 'level', 'balance', 'warnings', 'name'];

const STANDINGS: MemberStanding[] = ['clean', 'warned', 'timed-out', 'banned'];

type MembersScreenProps = {
	members: Member[];
	roles: Role[];
	memberCount: number;
	currency: string;
};

export function MembersScreen({ members, roles, memberCount, currency }: MembersScreenProps) {
	const t = useTranslations('members');
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
				title={t('title')}
				description={t('description', {
					count: formatCount(memberCount),
					listed: members.length,
					brand: BRAND.name
				})}
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
						{ value: 'all', label: t('everyRole') },
						...roles.map((role) => ({ value: role.id, label: role.name }))
					]}
					value={roleId}
					onValueChange={setRoleId}
					className="w-44"
				/>

				<Select
					options={[
						{ value: 'all', label: t('anyStanding') },
						...STANDINGS.map((value) => ({ value, label: t(`standing.${value}`) }))
					]}
					value={standing}
					onValueChange={(next) => {
						setStanding(next as MemberStanding | 'all');
					}}
					className="w-40"
				/>

				<Select
					options={SORTS.map((value) => ({ value, label: t(`sort.${value}`) }))}
					value={sort}
					onValueChange={(next) => {
						setSort(next as MemberSort);
					}}
					className="ml-auto w-44"
				/>
			</div>

			<div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface shadow-1">
				{visible.length === 0 ? (
					<EmptyState icon={Users} title={t('emptyTitle')} description={t('emptyBody')} />
				) : (
					<div className="overflow-x-auto">
						<table className="w-full min-w-200 border-collapse text-left">
							<thead>
								<tr className="border-b border-border text-overline text-text-muted uppercase">
									<th className="px-4 py-3 font-mono font-semibold">{t('columns.member')}</th>
									<th className="px-4 py-3 font-mono font-semibold">{t('columns.roles')}</th>
									<th className="px-4 py-3 font-mono font-semibold">{t('columns.joined')}</th>
									<th className="px-4 py-3 text-right font-mono font-semibold">
										{t('columns.level')}
									</th>
									<th className="px-4 py-3 text-right font-mono font-semibold">{currency}</th>
									<th className="px-4 py-3 text-right font-mono font-semibold">
										{t('columns.warns')}
									</th>
									<th className="px-4 py-3 font-mono font-semibold">{t('columns.standing')}</th>
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
											aria-label={t('open', { name: member.name })}
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
													{t(`standing.${member.standing}`)}
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
				{t('showing', { shown: visible.length, total: members.length })}
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
