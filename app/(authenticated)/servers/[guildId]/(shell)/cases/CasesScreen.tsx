'use client';

import { Gavel, X } from 'lucide-react';
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
import { WRITE_CASES, caseStatus, colorOf, displayName, initialsOf } from '@/lib/cases';
import { can } from '@/lib/team';
import type { CapabilityCatalogDto } from '@/lib/api-url';
import { listCases } from '@/lib/cases-client';
import { useRelativeTime } from '@/lib/hooks/useRelativeTime';
import {
	CASE_STATUS_FILTERS,
	INFRACTION_TYPES,
	type CaseParticipant,
	type CaseStatus,
	type CaseStatusFilter,
	type InfractionType,
	type ModerationCase,
	type TeamRole
} from '@/lib/types/management';
import { CaseDrawer } from './CaseDrawer';

const TYPE_VARIANTS: Record<InfractionType, BadgeVariant> = {
	note: 'neutral',
	warn: 'warning',
	timeout: 'warning',
	mute: 'info',
	unmute: 'outline',
	kick: 'danger',
	ban: 'danger',
	softban: 'danger',
	unban: 'outline'
};

const STATUS_VARIANTS: Record<CaseStatus, BadgeVariant> = {
	standing: 'success',
	expired: 'neutral',
	revoked: 'outline',
	done: 'neutral'
};

const asType = (value: string): InfractionType | 'all' =>
	INFRACTION_TYPES.find((entry) => entry === value) ?? 'all';

export type CasesScreenProps = {
	guildId: string;
	catalog: CapabilityCatalogDto;
	viewerRole: TeamRole;
	cases: ModerationCase[];
	nextCursor: string | null;
	now: string;
};

export function CasesScreen({
	guildId,
	catalog,
	viewerRole,
	cases,
	nextCursor,
	now
}: CasesScreenProps) {
	const t = useTranslations('cases');
	const relativeTime = useRelativeTime();
	const at = useMemo(() => new Date(now), [now]);

	const [loaded, setLoaded] = useState(cases);
	const [cursor, setCursor] = useState(nextCursor);
	const [type, setType] = useState<InfractionType | 'all'>('all');
	const [status, setStatus] = useState<CaseStatusFilter | 'all'>('all');
	const [selected, setSelected] = useState<ModerationCase | null>(null);
	const [member, setMember] = useState<CaseParticipant | null>(null);
	const [pending, startTransition] = useTransition();

	const load = (next: {
		type?: InfractionType | 'all';
		member?: CaseParticipant | null;
		status?: CaseStatusFilter | 'all';
		append?: boolean;
	}): void => {
		const wantedType = next.type ?? type;
		const wantedStatus = next.status ?? status;
		const wantedMember = next.member === undefined ? member : next.member;

		startTransition(async () => {
			const result = await listCases(guildId, {
				...(wantedType === 'all' ? {} : { type: wantedType }),
				...(wantedStatus === 'all' ? {} : { status: wantedStatus }),
				...(wantedMember === null ? {} : { targetId: wantedMember.id }),
				...(next.append === true && cursor !== null ? { cursor } : {})
			});

			if (result.status === 'error') {
				toast.error(t('failed'), { description: result.message });
				return;
			}

			setLoaded((current) =>
				next.append === true ? [...current, ...result.page.cases] : result.page.cases
			);
			setCursor(result.page.nextCursor);
		});
	};

	return (
		<div className="w-full p-6 sm:p-8">
			<PageHeader title={t('title')} description={t('description')} />

			<div className="mt-6 flex flex-wrap items-center gap-3">
				<Select
					options={[
						{ value: 'all', label: t('everyType') },
						...INFRACTION_TYPES.map((value) => ({ value, label: t(`action.${value}`) }))
					]}
					value={type}
					onValueChange={(next) => {
						const chosen = asType(next);
						setType(chosen);
						load({ type: chosen });
					}}
					className="w-44"
					aria-label={t('type')}
				/>

				<SegmentedControl
					options={[
						{ value: 'all', label: t('all') },
						...CASE_STATUS_FILTERS.map((value) => ({ value, label: t(`filters.${value}`) }))
					]}
					value={status}
					onValueChange={(next) => {
						setStatus(next);
						load({ status: next });
					}}
					label={t('status')}
					size="sm"
				/>

				{member === null ? null : (
					<Button
						variant="ghost"
						size="sm"
						onClick={() => {
							setMember(null);
							load({ member: null });
						}}
					>
						<X className="size-3.5" aria-hidden />
						{t('memberFilter', { name: displayName(member) })}
					</Button>
				)}
			</div>

			<div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface shadow-1">
				{loaded.length === 0 ? (
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
								{loaded.map((entry) => {
									const entryStatus = caseStatus(entry, at);

									return (
										<tr
											key={entry.id}
											tabIndex={0}
											role="button"
											aria-label={t('open', { number: entry.number })}
											onClick={() => {
												setSelected(entry);
											}}
											onKeyDown={(event) => {
												if (event.key !== 'Enter' && event.key !== ' ') return;
												event.preventDefault();
												setSelected(entry);
											}}
											className="cursor-pointer border-b border-border transition-colors duration-120 ease-out last:border-0 hover:bg-surface-hover"
										>
											<td className="px-4 py-3 font-mono text-body-sm text-text-muted">
												#{entry.number}
											</td>
											<td className="px-4 py-3">
												<Badge variant={TYPE_VARIANTS[entry.type]}>
													{t(`action.${entry.type}`)}
												</Badge>
											</td>
											<td className="px-4 py-3">
												<div className="flex items-center gap-2">
													<Avatar
														initials={initialsOf(entry.target)}
														color={colorOf(entry.target)}
														shape="circle"
														size="sm"
													/>
													<span className="truncate text-body-sm">{displayName(entry.target)}</span>
												</div>
											</td>
											<td className="px-4 py-3 text-body-sm text-text-muted">
												{displayName(entry.moderator)}
											</td>
											<td className="max-w-80 px-4 py-3">
												<span className="block truncate text-body-sm text-text-muted">
													{entry.reason ?? t('noReason')}
												</span>
											</td>
											<td className="px-4 py-3 text-body-sm whitespace-nowrap text-text-muted">
												{relativeTime(entry.createdAt, at)}
											</td>
											<td className="px-4 py-3">
												<Badge variant={STATUS_VARIANTS[entryStatus]} dot>
													{t(`statuses.${entryStatus}`)}
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

			<CaseDrawer
				key={selected?.id ?? 'none'}
				guildId={guildId}
				entry={selected}
				now={at}
				canWrite={can(catalog, viewerRole, WRITE_CASES)}
				onClose={() => {
					setSelected(null);
				}}
				onOpenCase={setSelected}
				onFilterByMember={(participant) => {
					setSelected(null);
					setMember(participant);
					load({ member: participant });
				}}
				onRevoked={(updated) => {
					setSelected(updated);
					setLoaded((current) =>
						current.map((entry) => (entry.id === updated.id ? updated : entry))
					);
				}}
			/>
		</div>
	);
}
