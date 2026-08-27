'use client';

import { Check, Minus, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/management/PageHeader';
import { Avatar } from '@/components/layout/Avatar';
import { SettingsSection } from '@/components/modules/SettingsSection';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { BRAND } from '@/lib/brand';
import {
	assignableRoles,
	can,
	grantedCount,
	PERMISSIONS,
	ROLE_LABELS,
	ROLE_ORDER
} from '@/lib/team';
import { relativeTime } from '@/lib/time';
import type { TeamInvite, TeamMember, TeamRole } from '@/lib/types/management';
import { cn } from '@/lib/utils/cn';
import { newId } from '@/lib/utils/id';

type TeamScreenProps = {
	team: TeamMember[];
	invites: TeamInvite[];
	viewerRole: TeamRole;
};

export function TeamScreen({ team, invites, viewerRole }: TeamScreenProps) {
	const [members, setMembers] = useState(team);
	const [pending, setPending] = useState(invites);
	const [inviting, setInviting] = useState(false);
	const [handle, setHandle] = useState('');
	const [inviteRole, setInviteRole] = useState<TeamRole>('viewer');

	const options = assignableRoles(viewerRole);
	const canManage = options.length > 0;

	return (
		<div className="w-full p-6 sm:p-8">
			<PageHeader
				title="Team"
				description="Who can open this dashboard, and how far each of them can reach."
				action={
					<Button
						disabled={!canManage}
						onClick={() => {
							setInviting(true);
						}}
					>
						<UserPlus aria-hidden="true" />
						Invite
					</Button>
				}
			/>

			<div className="mt-6 flex flex-col gap-6">
				<Alert variant="info" title="Discord permissions grant access too">
					Anyone with <strong>Manage Server</strong> in Discord can open this dashboard as a
					Moderator, whether or not they appear below. Remove the Discord permission to remove that
					access — {BRAND.name} cannot override it.
				</Alert>

				<SettingsSection
					title="Dashboard access"
					description={`${String(members.length)} people, ${String(members.filter((member) => member.viaDiscord).length)} of them through Discord.`}
				>
					<div className="overflow-x-auto">
						<table className="w-full min-w-180 border-collapse text-left">
							<thead>
								<tr className="border-b border-border text-overline text-text-muted uppercase">
									<th className="py-2 pr-4 font-mono font-semibold">Person</th>
									<th className="py-2 pr-4 font-mono font-semibold">Seat</th>
									<th className="py-2 pr-4 font-mono font-semibold">Granted by</th>
									<th className="py-2 pr-4 font-mono font-semibold">Last seen</th>
									<th className="w-12 py-2 font-mono font-semibold" />
								</tr>
							</thead>
							<tbody>
								{members.map((member) => (
									<tr key={member.id} className="border-b border-border last:border-0">
										<td className="py-3 pr-4">
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
										<td className="py-3 pr-4">
											{member.role === 'owner' || member.viaDiscord ? (
												<Badge variant={member.role === 'owner' ? 'primary' : 'outline'}>
													{ROLE_LABELS[member.role]}
													{member.viaDiscord && member.role !== 'owner' ? ' · Discord' : ''}
												</Badge>
											) : (
												<Select
													options={options.map((role) => ({
														value: role,
														label: ROLE_LABELS[role]
													}))}
													value={member.role}
													onValueChange={(next) => {
														const role = options.find((entry) => entry === next);
														if (!role) return;
														setMembers((current) =>
															current.map((entry) =>
																entry.id === member.id ? { ...entry, role } : entry
															)
														);
														toast.success(`${member.name} is now a ${ROLE_LABELS[role]}`);
													}}
													disabled={!canManage}
													className="w-36"
												/>
											)}
										</td>
										<td className="py-3 pr-4 text-body-sm text-text-muted">
											{member.grantedBy}
											<span className="block text-caption font-normal text-text-muted">
												{relativeTime(member.grantedAt)}
											</span>
										</td>
										<td className="py-3 pr-4 text-body-sm whitespace-nowrap text-text-muted">
											{relativeTime(member.lastSeenAt)}
										</td>
										<td className="py-3">
											{member.role === 'owner' || member.viaDiscord ? null : (
												<Button
													variant="ghost-danger"
													size="sm"
													iconOnly
													disabled={!canManage}
													aria-label={`Remove ${member.name}`}
													onClick={() => {
														setMembers((current) =>
															current.filter((entry) => entry.id !== member.id)
														);
														toast.success(`${member.name} no longer has access`);
													}}
												>
													<Trash2 aria-hidden="true" />
												</Button>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</SettingsSection>

				{pending.length > 0 ? (
					<SettingsSection
						title="Pending invites"
						description="They take the seat the moment they sign in."
					>
						<ul className="flex flex-col">
							{pending.map((invite) => (
								<li
									key={invite.id}
									className="flex flex-wrap items-center gap-3 border-b border-border py-3 last:border-0"
								>
									<span className="font-mono text-body">{invite.handle}</span>
									<Badge variant="outline">{ROLE_LABELS[invite.role]}</Badge>
									<span className="text-caption font-normal text-text-muted">
										invited by {invite.invitedBy} · {relativeTime(invite.invitedAt)}
									</span>
									<Button
										variant="ghost-danger"
										size="sm"
										className="ml-auto"
										onClick={() => {
											setPending((current) => current.filter((entry) => entry.id !== invite.id));
											toast.success(`Invite to ${invite.handle} revoked`);
										}}
									>
										Revoke
									</Button>
								</li>
							))}
						</ul>
					</SettingsSection>
				) : null}

				<SettingsSection
					title="What each seat can do"
					description="Seats are cumulative — every row an Admin has, a Moderator has too, minus the ones marked off."
				>
					<div className="overflow-x-auto">
						<table className="w-full min-w-160 border-collapse text-left">
							<thead>
								<tr className="border-b border-border text-overline text-text-muted uppercase">
									<th className="py-2 pr-4 font-mono font-semibold">Permission</th>
									{ROLE_ORDER.map((role) => (
										<th key={role} className="w-24 py-2 text-center font-mono font-semibold">
											{ROLE_LABELS[role]}
											<span className="tabular block text-caption font-normal text-text-muted normal-case">
												{grantedCount(role)}
											</span>
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{PERMISSIONS.map((permission) => (
									<tr key={permission.id} className="border-b border-border last:border-0">
										<td className="py-3 pr-4">
											<p className="text-body">{permission.label}</p>
											<p className="text-caption font-normal text-text-muted">
												{permission.description}
											</p>
										</td>
										{ROLE_ORDER.map((role) => {
											const granted = can(role, permission.id);
											return (
												<td key={role} className="py-3 text-center">
													<span
														className={cn(
															'inline-grid size-6 place-items-center rounded-full',
															granted ? 'bg-success-subtle' : 'bg-surface-sunken'
														)}
													>
														{granted ? (
															<Check className="size-3.5 text-success" aria-hidden="true" />
														) : (
															<Minus className="size-3.5 text-text-subtle" aria-hidden="true" />
														)}
														<span className="sr-only">{granted ? 'granted' : 'not granted'}</span>
													</span>
												</td>
											);
										})}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</SettingsSection>
			</div>

			<Dialog
				open={inviting}
				onOpenChange={setInviting}
				title="Invite to the dashboard"
				description="They get an invite link. Access starts when they sign in with Discord."
				footer={
					<>
						<Button
							variant="ghost"
							onClick={() => {
								setInviting(false);
							}}
						>
							Cancel
						</Button>
						<Button
							disabled={handle.trim() === ''}
							onClick={() => {
								setPending((current) => [
									...current,
									{
										id: newId('inv'),
										handle: handle.trim(),
										role: inviteRole,
										invitedBy: 'you',
										invitedAt: new Date().toISOString()
									}
								]);
								toast.success(`Invited ${handle.trim()}`, {
									description: `They join as a ${ROLE_LABELS[inviteRole]}.`
								});
								setHandle('');
								setInviteRole('viewer');
								setInviting(false);
							}}
						>
							Send invite
						</Button>
					</>
				}
			>
				<div className="flex flex-col gap-4">
					<Field label="Discord handle" hint="The @name, not the display name.">
						<Input
							value={handle}
							onChange={(event) => {
								setHandle(event.target.value);
							}}
							placeholder="@someone"
						/>
					</Field>

					<Field label="Seat">
						<Select
							options={options.map((role) => ({ value: role, label: ROLE_LABELS[role] }))}
							value={inviteRole}
							onValueChange={(next) => {
								const role = options.find((entry) => entry === next);
								if (role) setInviteRole(role);
							}}
						/>
					</Field>

					<p className="text-body-sm text-text-muted">
						A {ROLE_LABELS[inviteRole]} gets {grantedCount(inviteRole)} of {PERMISSIONS.length}{' '}
						permissions.
					</p>
				</div>
			</Dialog>
		</div>
	);
}
