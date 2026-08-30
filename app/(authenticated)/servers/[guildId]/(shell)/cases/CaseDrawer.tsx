'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Avatar } from '@/components/layout/Avatar';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import {
	caseStatus,
	colorOf,
	displayName,
	durationParts,
	initialsOf,
	MAX_REVOKE_REASON,
	touchesDiscord,
	undoKind
} from '@/lib/cases';
import { listCases, revokeCase } from '@/lib/cases-client';
import { useRelativeTime } from '@/lib/hooks/useRelativeTime';
import type { CaseParticipant, CaseStatus, ModerationCase } from '@/lib/types/management';

const STATUS_VARIANTS: Record<CaseStatus, BadgeVariant> = {
	standing: 'success',
	expired: 'neutral',
	revoked: 'outline',
	done: 'neutral'
};

type CaseDrawerProps = {
	guildId: string;
	entry: ModerationCase | null;
	now: Date;
	canWrite: boolean;
	onClose: () => void;
	onOpenCase: (entry: ModerationCase) => void;
	onFilterByMember: (participant: CaseParticipant) => void;
	onRevoked: (entry: ModerationCase) => void;
};

function Person({ participant }: { participant: CaseParticipant }) {
	const name = displayName(participant);

	return (
		<div className="flex items-center gap-2.5">
			<Avatar
				initials={initialsOf(participant)}
				color={colorOf(participant)}
				shape="circle"
				size="sm"
			/>
			<div className="min-w-0">
				<p className="truncate text-body">{name}</p>
				{name === participant.id ? null : (
					<p className="truncate font-mono text-caption font-normal text-text-muted">
						{participant.id}
					</p>
				)}
			</div>
		</div>
	);
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<div className="flex flex-col gap-1 border-b border-border py-3 last:border-0">
			<p className="text-overline text-text-muted uppercase">{label}</p>
			<div className="text-body-sm">{children}</div>
		</div>
	);
}

export function CaseDrawer({
	guildId,
	entry,
	now,
	canWrite,
	onClose,
	onOpenCase,
	onFilterByMember,
	onRevoked
}: CaseDrawerProps) {
	const t = useTranslations('cases');
	const relativeTime = useRelativeTime();
	const [others, setOthers] = useState<ModerationCase[] | null>(null);
	const [reason, setReason] = useState('');
	const [busy, setBusy] = useState(false);
	const targetId = entry?.target.id ?? null;
	const currentId = entry?.id ?? null;

	useEffect(() => {
		if (targetId === null) return;

		let live = true;

		void listCases(guildId, { targetId, limit: 10 }).then((result) => {
			if (!live) return;

			setOthers(
				result.status === 'ok' ? result.page.cases.filter((other) => other.id !== currentId) : []
			);
		});

		return () => {
			live = false;
		};
	}, [guildId, targetId, currentId]);

	const undo = (target: ModerationCase): void => {
		setBusy(true);

		void revokeCase(guildId, target.number, reason.trim() === '' ? null : reason.trim()).then(
			(result) => {
				setBusy(false);

				if (result.status === 'error') {
					toast.error(t('undo.failed'), { description: result.message });
					return;
				}

				const created = result.revoked.createdNumber;

				toast.success(
					created === null
						? t('undo.done', { number: target.number })
						: t('undo.doneWithCase', { number: target.number, created })
				);

				onRevoked(result.revoked.case);
			},
			(error: unknown) => {
				setBusy(false);
				toast.error(t('undo.failed'), {
					description: error instanceof Error ? error.message : ''
				});
			}
		);
	};

	if (entry === null) return null;

	const status = caseStatus(entry, now);
	const duration = entry.durationSeconds === null ? null : durationParts(entry.durationSeconds);
	const kind = undoKind(entry, now);

	return (
		<Drawer
			open
			onOpenChange={(next) => {
				if (!next) onClose();
			}}
			title={t('drawer.title', { number: entry.number })}
		>
			<div className="flex flex-col gap-4">
				<div className="flex flex-wrap items-center gap-2">
					<Badge variant="outline">{t(`action.${entry.type}`)}</Badge>
					<Badge variant={STATUS_VARIANTS[status]} dot>
						{t(`statuses.${status}`)}
					</Badge>
					<span className="text-body-sm text-text-muted">{t(`statusHelp.${status}`)}</span>
				</div>

				<div>
					<Row label={t('drawer.target')}>
						<Person participant={entry.target} />
						{entry.target.name === null ? (
							<p className="mt-1 text-caption font-normal text-text-muted">
								{t('unknownMemberHint')}
							</p>
						) : null}
					</Row>

					<Row label={t('drawer.moderator')}>
						<Person participant={entry.moderator} />
					</Row>

					<Row label={t('drawer.reason')}>
						<p className="text-pretty">{entry.reason ?? t('noReason')}</p>
					</Row>

					<Row label={t('drawer.opened')}>{relativeTime(entry.createdAt, now)}</Row>

					<Row label={t('drawer.duration')}>
						{duration === null
							? t('drawer.permanent')
							: t(`duration.${duration.unit}`, { count: duration.count })}
					</Row>

					{entry.expiresAt === null ? null : (
						<Row label={t('drawer.liftsAt')}>{relativeTime(entry.expiresAt, now)}</Row>
					)}

					{entry.revokedAt === null ? null : (
						<Row label={t('drawer.revokedAt')}>{relativeTime(entry.revokedAt, now)}</Row>
					)}

					{entry.revokedBy === null ? null : (
						<Row label={t('drawer.revokedBy')}>
							<Person participant={entry.revokedBy} />
						</Row>
					)}

					{entry.revokeReason === null ? null : (
						<Row label={t('drawer.revokeReason')}>{entry.revokeReason}</Row>
					)}
				</div>

				<div>
					<p className="text-overline text-text-muted uppercase">
						{t('drawer.otherCases', { name: displayName(entry.target) })}
					</p>

					{others === null ? (
						<p className="mt-2 text-body-sm text-text-muted">{t('drawer.loadingOthers')}</p>
					) : others.length === 0 ? (
						<p className="mt-2 text-body-sm text-text-muted">{t('drawer.onlyCase')}</p>
					) : (
						<ul className="mt-2 flex flex-col gap-1">
							{others.map((other) => (
								<li key={other.id}>
									<button
										type="button"
										onClick={() => {
											onOpenCase(other);
										}}
										className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors duration-120 ease-out hover:bg-surface-hover"
									>
										<span className="font-mono text-caption text-text-muted">#{other.number}</span>
										<Badge variant="outline">{t(`action.${other.type}`)}</Badge>
										<span className="truncate text-body-sm text-text-muted">
											{relativeTime(other.createdAt, now)}
										</span>
									</button>
								</li>
							))}
						</ul>
					)}

					<Button
						variant="ghost"
						size="sm"
						className="mt-2"
						onClick={() => {
							onFilterByMember(entry.target);
						}}
					>
						{t('drawer.filterByMember')}
					</Button>
				</div>

				{kind === null || !canWrite ? (
					<p className="text-caption font-normal text-text-muted">{t('drawer.revokeHint')}</p>
				) : (
					<div className="flex flex-col gap-3 border-t border-border pt-4">
						<Field label={t('undo.reason')} hint={t('undo.reasonHint')}>
							<Input
								value={reason}
								maxLength={MAX_REVOKE_REASON}
								onChange={(event) => {
									setReason(event.target.value);
								}}
							/>
						</Field>

						<p className="text-caption font-normal text-text-muted">
							{touchesDiscord(kind) ? t('undo.confirmDiscord') : t('undo.confirmWithdraw')}
						</p>

						<Button
							variant="danger"
							loading={busy}
							disabled={busy}
							onClick={() => {
								undo(entry);
							}}
						>
							{t(`undo.${kind}`)}
						</Button>
					</div>
				)}
			</div>
		</Drawer>
	);
}
