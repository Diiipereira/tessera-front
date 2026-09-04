'use client';

import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Avatar } from '@/components/layout/Avatar';
import { PageHeader } from '@/components/management/PageHeader';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { useRelativeTime } from '@/lib/hooks/useRelativeTime';
import {
	MEMBER_SORTS,
	MEMBER_STANDINGS,
	blankMemberQuery,
	firstShown,
	isSearching,
	lastShown,
	pageCount,
	type MemberQuery,
	type MemberSort
} from '@/lib/members';
import { loadMembers, type MemberPage } from '@/lib/members-client';
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

type MembersScreenProps = {
	guildId: string;
	page: MemberPage;
	memberCount: number;
	currency: string | null;
	levelsOn: boolean;
	roles: Role[];
	now?: string;
};

export function MembersScreen({
	guildId,
	page,
	memberCount,
	currency,
	levelsOn,
	roles,
	now
}: MembersScreenProps) {
	const t = useTranslations('members');
	const relativeTime = useRelativeTime();
	const money = currency ?? t('currency');
	const [query, setQuery] = useState<MemberQuery>(blankMemberQuery);
	const [listed, setListed] = useState(page);
	const [loading, setLoading] = useState(false);
	const [selected, setSelected] = useState<Member | null>(null);

	const at = now === undefined ? new Date() : new Date(now);
	const searching = isSearching(query);

	useEffect(() => {
		if (query === blankMemberQuery) return;

		let dropped = false;
		const timer = setTimeout(() => {
			setLoading(true);

			void loadMembers(guildId, query).then((result) => {
				if (dropped) return;

				setLoading(false);

				if (result.status === 'error') {
					toast.error(t('loadFailed'), { description: result.message });
					return;
				}

				setListed(result.page);
			});
		}, 250);

		return () => {
			dropped = true;
			clearTimeout(timer);
		};
	}, [guildId, query, t]);

	function change(patch: Partial<MemberQuery>) {
		setQuery((current) => ({ ...current, page: 0, ...patch }));
	}

	const pages = pageCount(listed.total);
	const members = listed.members;

	return (
		<div className="w-full p-6 sm:p-8">
			<PageHeader
				title={t('title')}
				description={t('description', { count: formatCount(memberCount) })}
			/>

			<div className="mt-6 flex flex-wrap items-center gap-3">
				<SearchInput
					value={query.query}
					onValueChange={(next) => {
						change({ query: next });
					}}
					placeholder={t('search')}
					aria-label={t('searchLabel')}
					className="max-w-72"
				/>

				<Select
					options={[
						{ value: 'all', label: t('anyStanding') },
						...MEMBER_STANDINGS.map((value) => ({ value, label: t(`standing.${value}`) }))
					]}
					value={query.standing}
					onValueChange={(next) => {
						change({ standing: next as MemberStanding | 'all' });
					}}
					className="w-40"
				/>

				{searching ? null : (
					<Select
						options={MEMBER_SORTS.map((value) => ({ value, label: t(`sort.${value}`) }))}
						value={query.sort}
						onValueChange={(next) => {
							change({ sort: next as MemberSort });
						}}
						className="ml-auto w-44"
					/>
				)}
			</div>

			{searching ? (
				<p className="mt-3 text-caption font-normal text-text-muted">{t('searchNote')}</p>
			) : null}

			<div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface shadow-1">
				{members.length === 0 ? (
					<EmptyState
						icon={Users}
						title={t('emptyTitle')}
						description={searching ? t('emptySearch') : t('emptyBody')}
					/>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full min-w-200 border-collapse text-left">
							<thead>
								<tr className="border-b border-border text-overline text-text-muted uppercase">
									<th className="px-4 py-3 font-mono font-semibold">{t('columns.member')}</th>
									<th className="px-4 py-3 font-mono font-semibold">{t('columns.lastEarned')}</th>
									<th className="px-4 py-3 text-right font-mono font-semibold">
										{t('columns.level')}
									</th>
									<th className="px-4 py-3 text-right font-mono font-semibold">
										{t('columns.earningMessages')}
									</th>
									<th className="px-4 py-3 text-right font-mono font-semibold">{money}</th>
									<th className="px-4 py-3 text-right font-mono font-semibold">
										{t('columns.warns')}
									</th>
									<th className="px-4 py-3 font-mono font-semibold">{t('columns.standing')}</th>
								</tr>
							</thead>
							<tbody>
								{members.map((member) => (
									<tr
										key={member.id}
										tabIndex={0}
										role="button"
										aria-label={t('open', { name: member.name })}
										onClick={() => {
											setSelected(member);
										}}
										onKeyDown={(event) => {
											if (event.key !== 'Enter' && event.key !== ' ') return;
											event.preventDefault();
											setSelected(member);
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
										<td className="px-4 py-3 text-body-sm whitespace-nowrap text-text-muted">
											{levelsOn ? relativeTime(member.lastEarnedAt, at) : t('levelsOff')}
										</td>
										<td className="tabular px-4 py-3 text-right text-body-sm">{member.level}</td>
										<td className="tabular px-4 py-3 text-right text-body-sm text-text-muted">
											{formatCount(member.earningMessages)}
										</td>
										<td className="tabular px-4 py-3 text-right text-body-sm">
											{formatCount(member.balance)}
										</td>
										<td className="tabular px-4 py-3 text-right text-body-sm">
											{member.warnings === 0 ? (
												<span className="text-text-muted">—</span>
											) : (
												<span className="text-warning-fg">{member.warnings}</span>
											)}
										</td>
										<td className="px-4 py-3">
											<Badge variant={STANDING_VARIANTS[member.standing]} dot>
												{t(`standing.${member.standing}`)}
											</Badge>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			<div className="mt-3 flex flex-wrap items-center gap-3">
				<p className="text-caption font-normal text-text-muted">
					{searching
						? t('showingSearch', { shown: members.length })
						: t('showing', {
								first: firstShown(query.page, members.length),
								last: lastShown(query.page, members.length),
								total: listed.total
							})}
				</p>

				{searching ? null : (
					<div className="ml-auto flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={query.page === 0 || loading}
							aria-label={t('previousPage')}
							onClick={() => {
								setQuery((current) => ({ ...current, page: current.page - 1 }));
							}}
						>
							<ChevronLeft aria-hidden="true" />
						</Button>
						<span className="text-caption font-normal text-text-muted">
							{t('pageOf', { page: query.page + 1, pages })}
						</span>
						<Button
							variant="outline"
							size="sm"
							disabled={query.page + 1 >= pages || loading}
							aria-label={t('nextPage')}
							onClick={() => {
								setQuery((current) => ({ ...current, page: current.page + 1 }));
							}}
						>
							<ChevronRight aria-hidden="true" />
						</Button>
					</div>
				)}
			</div>

			<MemberDrawer
				key={selected?.id ?? 'none'}
				guildId={guildId}
				member={selected}
				roles={roles}
				currency={money}
				levelsOn={levelsOn}
				now={now}
				onClose={() => {
					setSelected(null);
				}}
			/>
		</div>
	);
}
