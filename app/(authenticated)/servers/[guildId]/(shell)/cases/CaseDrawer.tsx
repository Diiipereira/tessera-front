'use client';

import { Paperclip, Undo2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { Avatar } from '@/components/layout/Avatar';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Field } from '@/components/ui/Field';
import { Textarea } from '@/components/ui/Textarea';
import { caseStatus, relatedCases } from '@/lib/cases';
import { absoluteTime, relativeTime, remaining } from '@/lib/time';
import type { CaseStatus, ModerationCase } from '@/lib/types/management';
import type { ModerationAction } from '@/lib/types/modules';

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

type CaseDrawerProps = {
	entry: ModerationCase | null;
	cases: ModerationCase[];
	onClose: () => void;
	onRevoke: (id: string) => void;
	onEditReason: (id: string, reason: string) => void;
	onOpenCase: (id: string) => void;
};

export function CaseDrawer({
	entry,
	cases,
	onClose,
	onRevoke,
	onEditReason,
	onOpenCase
}: CaseDrawerProps) {
	const t = useTranslations('cases');
	const shared = useTranslations('common');
	const [editing, setEditing] = useState(false);
	const [reason, setReason] = useState(entry?.reason ?? '');

	if (!entry) return null;

	const status = caseStatus(entry);
	const related = relatedCases(cases, entry);
	const expiresIn = remaining(entry.expiresAt);

	return (
		<Drawer
			open
			onOpenChange={(next) => {
				if (!next) onClose();
			}}
			title={`Case #${String(entry.number)}`}
			header={
				<div className="flex items-center gap-2">
					<span className="font-mono text-h3">#{entry.number}</span>
					<Badge variant={ACTION_VARIANTS[entry.action]}>{t(`action.${entry.action}`)}</Badge>
					<Badge variant={STATUS_VARIANTS[status]} dot>
						{STATUS_LABELS[status]}
					</Badge>
				</div>
			}
			footer={
				<div className="flex flex-wrap gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={editing}
						onClick={() => {
							setReason(entry.reason);
							setEditing(true);
						}}
					>
						Edit reason
					</Button>
					<Button
						variant="danger"
						size="sm"
						disabled={status === 'revoked'}
						onClick={() => {
							onRevoke(entry.id);
							toast.success(t('drawer.revoked', { number: entry.number }), {
								description: t('drawer.revokedHint')
							});
						}}
					>
						<Undo2 aria-hidden="true" />
						{status === 'revoked' ? t('drawer.alreadyRevoked') : t('drawer.revoke')}
					</Button>
				</div>
			}
		>
			<div className="flex flex-col gap-5">
				<div className="grid gap-3 sm:grid-cols-2">
					<Party
						label={t('drawer.target')}
						name={entry.targetName}
						initials={entry.targetInitials}
						color={entry.targetColor}
					/>
					<Party
						label={t('drawer.moderator')}
						name={entry.moderatorName}
						initials={entry.moderatorInitials}
						color={entry.moderatorColor}
					/>
				</div>

				<div>
					<p className="mb-1.5 font-mono text-overline text-text-muted uppercase">
						{t('drawer.reason')}
					</p>
					{editing ? (
						<div className="flex flex-col gap-2">
							<Field help={t('drawer.reasonHelp')}>
								<Textarea
									value={reason}
									onChange={(event) => {
										setReason(event.target.value);
									}}
									maxLength={512}
									showCount
								/>
							</Field>
							<div className="flex gap-2">
								<Button
									size="sm"
									onClick={() => {
										onEditReason(entry.id, reason);
										setEditing(false);
										toast.success(t('drawer.reasonSaved'), {
											description: t('drawer.reasonSavedHint')
										});
									}}
								>
									{t('drawer.saveReason')}
								</Button>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										setEditing(false);
									}}
								>
									{shared('cancel')}
								</Button>
							</div>
						</div>
					) : (
						<p className="text-body text-pretty">{entry.reason}</p>
					)}
				</div>

				<dl className="flex flex-col gap-2">
					<Row
						label={t('drawer.opened')}
						value={`${relativeTime(entry.createdAt)} · ${absoluteTime(entry.createdAt)}`}
					/>
					<Row
						label={t('drawer.duration')}
						value={entry.expiresAt === null ? t('drawer.permanent') : absoluteTime(entry.expiresAt)}
					/>
					{expiresIn === null ? null : <Row label={t('drawer.liftsIn')} value={expiresIn} />}
				</dl>

				<div>
					<p className="mb-1.5 font-mono text-overline text-text-muted uppercase">Evidence</p>
					{entry.evidence.length === 0 ? (
						<p className="text-body-sm text-text-muted">
							Nothing attached. Screenshots uploaded with the slash command land here.
						</p>
					) : (
						<ul className="flex flex-col gap-1.5">
							{entry.evidence.map((file) => (
								<li
									key={file}
									className="flex items-center gap-2 rounded-md border border-border bg-surface-sunken px-3 py-2"
								>
									<Paperclip className="size-4 shrink-0 text-text-subtle" aria-hidden="true" />
									<span className="min-w-0 flex-1 truncate font-mono text-caption text-text-muted">
										{file}
									</span>
								</li>
							))}
						</ul>
					)}
				</div>

				<div>
					<p className="mb-1.5 font-mono text-overline text-text-muted uppercase">
						Other cases for {entry.targetName}
					</p>
					{related.length === 0 ? (
						<p className="text-body-sm text-text-muted">This is their only case.</p>
					) : (
						<ul className="flex flex-col gap-1.5">
							{related.map((other) => (
								<li key={other.id}>
									<button
										type="button"
										onClick={() => {
											onOpenCase(other.id);
										}}
										className="flex w-full items-center gap-2 rounded-md border border-border bg-surface-sunken px-3 py-2 text-left transition-colors duration-120 ease-out hover:border-border-strong"
									>
										<span className="font-mono text-caption text-text-muted">#{other.number}</span>
										<Badge variant={ACTION_VARIANTS[other.action]}>
											{t(`action.${other.action}`)}
										</Badge>
										<span className="min-w-0 flex-1 truncate text-body-sm">{other.reason}</span>
										<span className="shrink-0 text-caption font-normal text-text-muted">
											{relativeTime(other.createdAt)}
										</span>
									</button>
								</li>
							))}
						</ul>
					)}
				</div>

				<div>
					<p className="mb-1.5 font-mono text-overline text-text-muted uppercase">History</p>
					{entry.history.length === 0 ? (
						<p className="text-body-sm text-text-muted">Never edited since it was opened.</p>
					) : (
						<ul className="flex flex-col gap-2 border-l border-border pl-3">
							{entry.history.map((edit) => (
								<li key={edit.id}>
									<p className="text-body-sm">{edit.summary}</p>
									<p className="text-caption font-normal text-text-muted">
										{edit.author} · {relativeTime(edit.at)}
									</p>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</Drawer>
	);
}

function Party({
	label,
	name,
	initials,
	color
}: {
	label: string;
	name: string;
	initials: string;
	color: string;
}) {
	return (
		<div className="rounded-md border border-border bg-surface-sunken p-3">
			<p className="font-mono text-overline text-text-muted uppercase">{label}</p>
			<div className="mt-1.5 flex items-center gap-2">
				<Avatar initials={initials} color={color} shape="circle" size="sm" />
				<span className="min-w-0 truncate text-body">{name}</span>
			</div>
		</div>
	);
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-baseline justify-between gap-4 border-b border-border pb-2 last:border-0">
			<dt className="text-body-sm text-text-muted">{label}</dt>
			<dd className="text-right text-body-sm">{value}</dd>
		</div>
	);
}
