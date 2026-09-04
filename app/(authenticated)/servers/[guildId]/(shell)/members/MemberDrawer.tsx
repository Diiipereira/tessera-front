'use client';

import { Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Avatar } from '@/components/layout/Avatar';
import { RoleChips } from '@/components/management/RoleChips';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { listCases } from '@/lib/cases-client';
import { useRelativeTime } from '@/lib/hooks/useRelativeTime';
import { loadMember } from '@/lib/members-client';
import { guildHref } from '@/lib/navigation';
import { absoluteTime } from '@/lib/time';
import type { Role } from '@/lib/types/discord';
import type {
	InfractionType,
	Member,
	MemberDetail,
	MemberStanding,
	ModerationCase
} from '@/lib/types/management';
import { formatCount } from '@/lib/utils/format';

const STANDING_VARIANTS: Record<MemberStanding, BadgeVariant> = {
	clean: 'success',
	warned: 'warning',
	'timed-out': 'warning',
	banned: 'danger'
};

const CASE_VARIANTS: Record<InfractionType, BadgeVariant> = {
	note: 'neutral',
	warn: 'warning',
	timeout: 'warning',
	mute: 'info',
	unmute: 'success',
	kick: 'danger',
	ban: 'danger',
	softban: 'danger',
	unban: 'success'
};

const CASES_SHOWN = 10;

type Tab = 'overview' | 'infractions' | 'roles';

type MemberDrawerProps = {
	guildId: string;
	member: Member | null;
	roles?: Role[];
	currency: string;
	levelsOn: boolean;
	now?: string;
	onClose: () => void;
};

export function MemberDrawer({
	guildId,
	member,
	roles = [],
	currency,
	levelsOn,
	now,
	onClose
}: MemberDrawerProps) {
	const t = useTranslations('members.drawer');
	const caseActions = useTranslations('cases.action');
	const standings = useTranslations('members.standing');
	const relativeTime = useRelativeTime();
	const [tab, setTab] = useState<Tab>('overview');
	const [detail, setDetail] = useState<MemberDetail | null>(null);
	const [cases, setCases] = useState<ModerationCase[] | null>(null);

	const at = now === undefined ? new Date() : new Date(now);
	const memberId = member?.id ?? null;

	useEffect(() => {
		if (memberId === null) return;

		let dropped = false;

		void loadMember(guildId, memberId).then((result) => {
			if (dropped || result.status === 'error') return;

			setDetail(result.detail);
		});

		void listCases(guildId, { targetId: memberId, limit: CASES_SHOWN }).then((result) => {
			if (dropped || result.status === 'error') return;

			setCases(result.page.cases);
		});

		return () => {
			dropped = true;
		};
	}, [guildId, memberId]);

	if (member === null) return null;

	return (
		<Drawer
			open
			onOpenChange={(next) => {
				if (!next) onClose();
			}}
			title={member.name}
			header={
				<div className="flex items-center gap-3">
					<Avatar
						initials={member.initials}
						color={member.color}
						shape="circle"
						size="lg"
						className="ring-2 ring-surface"
					/>
					<div className="min-w-0 flex-1">
						<p className="truncate text-h4">{member.name}</p>
						<p className="truncate font-mono text-caption font-normal text-text-muted">
							{member.handle}
						</p>
					</div>
					<Badge variant={STANDING_VARIANTS[member.standing]} dot>
						{standings(member.standing)}
					</Badge>
				</div>
			}
		>
			<div className="flex flex-col gap-5">
				<div className="flex items-center gap-2">
					<code className="min-w-0 flex-1 truncate rounded-md border border-border bg-surface-sunken px-2 py-1.5 font-mono text-caption text-text-muted">
						{member.id}
					</code>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => {
							void navigator.clipboard.writeText(member.id).then(
								() => {
									toast.success(t('copied'));
								},
								() => {
									toast.error(t('copyRefused'));
								}
							);
						}}
					>
						<Copy aria-hidden="true" />
						{t('copyId')}
					</Button>
				</div>

				{detail !== null && !detail.present ? (
					<p className="rounded-md border border-border bg-surface-sunken p-3 text-body-sm text-text-muted">
						{t('gone')}
					</p>
				) : null}

				<dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
					<Stat label={t('level')} value={String(member.level)} />
					<Stat label={t('earningMessages')} value={formatCount(member.earningMessages)} />
					<Stat label={currency} value={formatCount(member.balance)} />
					<Stat
						label={t('warnings')}
						value={String(member.warnings)}
						tone={member.warnings > 0 ? 'warn' : 'flat'}
					/>
				</dl>

				<SegmentedControl
					options={[
						{ value: 'overview', label: t('overview') },
						{ value: 'infractions', label: t('infractions'), count: member.infractions },
						{ value: 'roles', label: t('roles'), count: detail?.roleIds.length ?? 0 }
					]}
					value={tab}
					onValueChange={(next) => {
						setTab(next);
					}}
					label={t('section')}
					size="sm"
				/>

				{tab === 'overview' ? (
					<div className="flex flex-col gap-4">
						{detail?.joinedAt == null ? null : (
							<Row
								label={t('joined')}
								value={`${relativeTime(detail.joinedAt, at)} · ${absoluteTime(detail.joinedAt)}`}
							/>
						)}
						{detail?.nickname == null ? null : (
							<Row label={t('nickname')} value={detail.nickname} />
						)}
						{levelsOn ? (
							<Row label={t('lastEarned')} value={relativeTime(member.lastEarnedAt, at)} />
						) : (
							<Row label={t('lastEarned')} value={t('levelsOff')} />
						)}
						<Row label={t('xp')} value={t('xpTotal', { amount: formatCount(member.xp) })} />
						<Row
							label={t('voice')}
							value={t('voiceMinutes', { amount: Math.floor(member.voiceSeconds / 60) })}
						/>
						{detail?.timedOutUntil == null ? null : (
							<Row
								label={t('timedOut')}
								value={`${relativeTime(detail.timedOutUntil, at)} · ${absoluteTime(detail.timedOutUntil)}`}
							/>
						)}
						<p className="text-body-sm text-text-muted">{t('countedOnly')}</p>
					</div>
				) : null}

				{tab === 'infractions' ? (
					cases === null ? (
						<p className="text-body-sm text-text-muted">{t('loadingCases')}</p>
					) : cases.length === 0 ? (
						<p className="text-body-sm text-text-muted">{t('noInfractions')}</p>
					) : (
						<div className="flex flex-col gap-3">
							<ul className="flex flex-col gap-2">
								{cases.map((entry) => (
									<li
										key={entry.id}
										className="rounded-md border border-border bg-surface-sunken p-3"
									>
										<div className="flex items-center gap-2">
											<Badge variant={CASE_VARIANTS[entry.type]}>{caseActions(entry.type)}</Badge>
											<span className="font-mono text-caption text-text-muted">
												#{entry.number}
											</span>
											<span className="ml-auto text-caption font-normal text-text-muted">
												{relativeTime(entry.createdAt, at)}
											</span>
										</div>
										{entry.reason === null ? null : (
											<p className="mt-2 text-body-sm">{entry.reason}</p>
										)}
										<p className="mt-1 text-caption font-normal text-text-muted">
											{t('by', {
												who: entry.moderator.name ?? entry.moderator.id
											})}
										</p>
									</li>
								))}
							</ul>
							<Button variant="outline" size="sm" href={guildHref(guildId, '/cases')}>
								{t('allCases')}
							</Button>
						</div>
					)
				) : null}

				{tab === 'roles' ? (
					<div className="flex flex-col gap-3">
						{detail === null ? (
							<p className="text-body-sm text-text-muted">{t('loadingRoles')}</p>
						) : detail.roleIds.length === 0 ? (
							<p className="text-body-sm text-text-muted">{t('noRoles')}</p>
						) : (
							<RoleChips roles={roles} roleIds={detail.roleIds} max={20} />
						)}
						<p className="text-body-sm text-text-muted">{t('rolesUpstream')}</p>
					</div>
				) : null}
			</div>
		</Drawer>
	);
}

function Stat({
	label,
	value,
	tone = 'flat'
}: {
	label: string;
	value: string;
	tone?: 'flat' | 'warn';
}) {
	return (
		<div className="rounded-md border border-border bg-surface-sunken px-3 py-2">
			<dt className="font-mono text-overline text-text-muted uppercase">{label}</dt>
			<dd className={tone === 'warn' ? 'tabular text-h4 text-warning-fg' : 'tabular text-h4'}>
				{value}
			</dd>
		</div>
	);
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-baseline justify-between gap-4 border-b border-border pb-2 last:border-0">
			<span className="text-body-sm text-text-muted">{label}</span>
			<span className="text-right text-body-sm">{value}</span>
		</div>
	);
}
