'use client';

import { Check, Minus, Trash2, UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
import type { CapabilityCatalogDto } from '@/lib/api-url';
import { assignableRoles, can, grantedCount } from '@/lib/team';
import { relativeTime } from '@/lib/time';
import type { TeamInvite, TeamMember, TeamRole } from '@/lib/types/management';
import { cn } from '@/lib/utils/cn';
import { newId } from '@/lib/utils/id';

type TeamScreenProps = {
	team: TeamMember[];
	invites: TeamInvite[];
	viewerRole: TeamRole;
	catalog: CapabilityCatalogDto;
};

export function TeamScreen({ team, invites, viewerRole, catalog }: TeamScreenProps) {
	const t = useTranslations('team');
	const names = useTranslations('capabilities');
	const [members, setMembers] = useState(team);
	const [pending, setPending] = useState(invites);
	const [inviting, setInviting] = useState(false);
	const [handle, setHandle] = useState('');
	const [inviteRole, setInviteRole] = useState<TeamRole>('viewer');

	const options = assignableRoles(catalog, viewerRole);
	const canManage = options.length > 0;

	return (
		<div className="w-full p-6 sm:p-8">
			<PageHeader
				title={t('title')}
				description={t('description')}
				action={
					<Button
						disabled={!canManage}
						onClick={() => {
							setInviting(true);
						}}
					>
						<UserPlus aria-hidden="true" />
						{t('invite')}
					</Button>
				}
			/>

			<div className="mt-6 flex flex-col gap-6">
				<Alert variant="info" title={t('discordTitle')}>
					{t.rich('discordBody', {
						role: t('role.moderator'),
						b: (chunks) => <strong>{chunks}</strong>
					})}{' '}
					{t('discordTail', { brand: BRAND.name })}
				</Alert>

				<SettingsSection
					title={t('access.title')}
					description={`${String(members.length)} people, ${String(members.filter((member) => member.viaDiscord).length)} of them through Discord.`}
				>
					<div className="overflow-x-auto">
						<table className="w-full min-w-180 border-collapse text-left">
							<thead>
								<tr className="border-b border-border text-overline text-text-muted uppercase">
									<th className="py-2 pr-4 font-mono font-semibold">{t('access.person')}</th>
									<th className="py-2 pr-4 font-mono font-semibold">{t('access.seat')}</th>
									<th className="py-2 pr-4 font-mono font-semibold">{t('access.grantedBy')}</th>
									<th className="py-2 pr-4 font-mono font-semibold">{t('access.lastSeen')}</th>
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
													{t(`role.${member.role}`)}
													{member.viaDiscord && member.role !== 'owner' ? t('viaDiscord') : ''}
												</Badge>
											) : (
												<Select
													options={options.map((role) => ({
														value: role,
														label: t(`role.${role}`)
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
														toast.success(
															t('access.changed', { name: member.name, role: t(`role.${role}`) })
														);
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
													aria-label={t('access.remove', { name: member.name })}
													onClick={() => {
														setMembers((current) =>
															current.filter((entry) => entry.id !== member.id)
														);
														toast.success(t('access.removed', { name: member.name }));
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
					<SettingsSection title={t('pending.title')} description={t('pending.description')}>
						<ul className="flex flex-col">
							{pending.map((invite) => (
								<li
									key={invite.id}
									className="flex flex-wrap items-center gap-3 border-b border-border py-3 last:border-0"
								>
									<span className="font-mono text-body">{invite.handle}</span>
									<Badge variant="outline">{t(`role.${invite.role}`)}</Badge>
									<span className="text-caption font-normal text-text-muted">
										{t('pending.invitedBy', { who: invite.invitedBy })} ·{' '}
										{relativeTime(invite.invitedAt)}
									</span>
									<Button
										variant="ghost-danger"
										size="sm"
										className="ml-auto"
										onClick={() => {
											setPending((current) => current.filter((entry) => entry.id !== invite.id));
											toast.success(t('pending.revoked', { handle: invite.handle }));
										}}
									>
										{t('revoke')}
									</Button>
								</li>
							))}
						</ul>
					</SettingsSection>
				) : null}

				<SettingsSection title={t('matrix.title')} description={t('matrix.description')}>
					<div className="overflow-x-auto">
						<table className="w-full min-w-160 border-collapse text-left">
							<thead>
								<tr className="border-b border-border text-overline text-text-muted uppercase">
									<th className="py-2 pr-4 font-mono font-semibold">{t('matrix.permission')}</th>
									{catalog.roles.map((role) => (
										<th key={role} className="w-24 py-2 text-center font-mono font-semibold">
											{t(`role.${role}`)}
											<span className="tabular block text-caption font-normal text-text-muted normal-case">
												{grantedCount(catalog, role)}
											</span>
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{catalog.capabilities.map((capability) => (
									<tr key={capability.key} className="border-b border-border last:border-0">
										<td className="py-3 pr-4">
											<p className="text-body">{names(`${capability.key}.label`)}</p>
											<p className="text-caption font-normal text-text-muted">
												{names(`${capability.key}.description`)}
											</p>
										</td>
										{catalog.roles.map((role) => {
											const granted = can(catalog, role, capability.key);
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
														<span className="sr-only">
															{granted ? t('granted') : t('notGranted')}
														</span>
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
				title={t('dialog.title')}
				description={t('dialog.description')}
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
								toast.success(t('dialog.invited', { handle: handle.trim() }), {
									description: t('dialog.joinAs', { role: t(`role.${inviteRole}`) })
								});
								setHandle('');
								setInviteRole('viewer');
								setInviting(false);
							}}
						>
							{t('dialog.submit')}
						</Button>
					</>
				}
			>
				<div className="flex flex-col gap-4">
					<Field label={t('dialog.handle')} hint={t('dialog.handleHint')}>
						<Input
							value={handle}
							onChange={(event) => {
								setHandle(event.target.value);
							}}
							placeholder="@someone"
						/>
					</Field>

					<Field label={t('dialog.seat')}>
						<Select
							options={options.map((role) => ({ value: role, label: t(`role.${role}`) }))}
							value={inviteRole}
							onValueChange={(next) => {
								const role = options.find((entry) => entry === next);
								if (role) setInviteRole(role);
							}}
						/>
					</Field>

					<p className="text-body-sm text-text-muted">
						{t('dialog.grants', {
							role: t(`role.${inviteRole}`),
							granted: grantedCount(catalog, inviteRole),
							total: catalog.capabilities.length
						})}
					</p>
				</div>
			</Dialog>
		</div>
	);
}
