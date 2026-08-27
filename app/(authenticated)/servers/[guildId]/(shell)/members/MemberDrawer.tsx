'use client';

import { Ban, Copy, Gavel, ShieldAlert, Timer } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { RoleChips } from '@/components/management/RoleChips';
import { Avatar } from '@/components/layout/Avatar';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { ACTION_LABELS } from '@/lib/cases';
import { STANDING_LABELS, warningCount } from '@/lib/members';
import { absoluteTime, relativeTime } from '@/lib/time';
import type { Role } from '@/lib/types/discord';
import type { Member, MemberStanding } from '@/lib/types/management';
import type { ModerationAction } from '@/lib/types/modules';
import { formatCount } from '@/lib/utils/format';

const STANDING_VARIANTS: Record<MemberStanding, BadgeVariant> = {
	clean: 'success',
	warned: 'warning',
	'timed-out': 'warning',
	banned: 'danger'
};

const ACTION_VARIANTS: Record<ModerationAction, BadgeVariant> = {
	warn: 'warning',
	timeout: 'warning',
	mute: 'info',
	kick: 'danger',
	ban: 'danger'
};

type Tab = 'overview' | 'infractions' | 'economy' | 'roles';

type MemberDrawerProps = {
	member: Member | null;
	roles: Role[];
	currency: string;
	onClose: () => void;
};

export function MemberDrawer({ member, roles, currency, onClose }: MemberDrawerProps) {
	const [tab, setTab] = useState<Tab>('overview');

	if (!member) return null;

	const warnings = warningCount(member);

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
						{STANDING_LABELS[member.standing]}
					</Badge>
				</div>
			}
			footer={
				<div className="flex flex-wrap gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							toast.success(`Warned ${member.name}`, { description: 'A case is opened for it.' });
						}}
					>
						<ShieldAlert aria-hidden="true" />
						Warn
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							toast.success(`Timed out ${member.name} for 1h`);
						}}
					>
						<Timer aria-hidden="true" />
						Timeout
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							toast.success(`Kicked ${member.name}`);
						}}
					>
						<Gavel aria-hidden="true" />
						Kick
					</Button>
					<Button
						variant="danger"
						size="sm"
						onClick={() => {
							toast.success(`Banned ${member.name}`);
						}}
					>
						<Ban aria-hidden="true" />
						Ban
					</Button>
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
									toast.success('ID copied');
								},
								() => {
									toast.error('The browser refused the clipboard');
								}
							);
						}}
					>
						<Copy aria-hidden="true" />
						Copy ID
					</Button>
				</div>

				<dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
					<Stat label="Level" value={String(member.level)} />
					<Stat label="Messages" value={formatCount(member.messages)} />
					<Stat label={currency} value={formatCount(member.balance)} />
					<Stat label="Warnings" value={String(warnings)} tone={warnings > 0 ? 'warn' : 'flat'} />
				</dl>

				<SegmentedControl
					options={[
						{ value: 'overview', label: 'Overview' },
						{ value: 'infractions', label: 'Infractions', count: member.infractions.length },
						{ value: 'economy', label: 'Economy' },
						{ value: 'roles', label: 'Roles', count: member.roleIds.length }
					]}
					value={tab}
					onValueChange={setTab}
					label="Member detail section"
					size="sm"
				/>

				{tab === 'overview' ? (
					<div className="flex flex-col gap-4">
						<Row
							label="Joined"
							value={`${relativeTime(member.joinedAt)} · ${absoluteTime(member.joinedAt)}`}
						/>
						<Row label="Last seen" value={relativeTime(member.lastSeenAt)} />
						<Row label="XP" value={`${formatCount(member.xp)} total`} />

						<div>
							<p className="mb-2 font-mono text-overline text-text-muted uppercase">Staff notes</p>
							{member.notes.length === 0 ? (
								<p className="text-body-sm text-text-muted">
									No notes. Notes are staff-only and never shown to the member.
								</p>
							) : (
								<ul className="flex flex-col gap-2">
									{member.notes.map((note) => (
										<li
											key={note.id}
											className="rounded-md border border-border bg-surface-sunken p-3"
										>
											<p className="text-body-sm">{note.body}</p>
											<p className="mt-1 text-caption font-normal text-text-muted">
												{note.author} · {relativeTime(note.at)}
											</p>
										</li>
									))}
								</ul>
							)}
						</div>
					</div>
				) : null}

				{tab === 'infractions' ? (
					member.infractions.length === 0 ? (
						<p className="text-body-sm text-text-muted">
							Nothing on record. This member has never been actioned.
						</p>
					) : (
						<ul className="flex flex-col gap-2">
							{member.infractions.map((infraction) => (
								<li
									key={infraction.id}
									className="rounded-md border border-border bg-surface-sunken p-3"
								>
									<div className="flex items-center gap-2">
										<Badge variant={ACTION_VARIANTS[infraction.action]}>
											{ACTION_LABELS[infraction.action]}
										</Badge>
										<span className="font-mono text-caption text-text-muted">
											#{infraction.caseNumber}
										</span>
										<span className="ml-auto text-caption font-normal text-text-muted">
											{relativeTime(infraction.at)}
										</span>
									</div>
									<p className="mt-2 text-body-sm">{infraction.reason}</p>
									<p className="mt-1 text-caption font-normal text-text-muted">
										by {infraction.moderator}
									</p>
								</li>
							))}
						</ul>
					)
				) : null}

				{tab === 'economy' ? (
					<div className="flex flex-col gap-4">
						<Row label="Balance" value={`${formatCount(member.balance)} ${currency}`} />
						<Row label="Rank by balance" value="Computed once the API exists" />
						<p className="text-body-sm text-text-muted">
							The transaction history for one member lives in the Economy module, filtered by this
							ID.
						</p>
					</div>
				) : null}

				{tab === 'roles' ? (
					<div className="flex flex-col gap-3">
						<RoleChips roles={roles} roleIds={member.roleIds} max={20} />
						<p className="text-body-sm text-text-muted">
							Roles are read from Discord. Changing them here writes back through the bot, which
							needs its own role above the one it grants.
						</p>
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
