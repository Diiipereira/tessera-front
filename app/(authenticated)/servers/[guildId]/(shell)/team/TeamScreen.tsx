'use client';

import { Check, Link2, Minus, Trash2, UserPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
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
import type { CapabilityCatalogDto, TeamListDto } from '@/lib/api-url';
import {
	assignableRoles,
	can,
	grantedCount,
	isFixedSeat,
	isSnowflake,
	toTeamMember
} from '@/lib/team';
import { deleteSeat, putSeat } from '@/lib/team-client';
import { guildHref } from '@/lib/navigation';
import { useRelativeTime } from '@/lib/hooks/useRelativeTime';
import type { TeamRole } from '@/lib/types/management';
import { cn } from '@/lib/utils/cn';

type TeamScreenProps = {
	guildId: string;
	catalog: CapabilityCatalogDto;
	team: TeamListDto;
	now?: string;
};

export function TeamScreen({ guildId, catalog, team, now }: TeamScreenProps) {
	const t = useTranslations('team');
	const common = useTranslations('common');
	const names = useTranslations('capabilities');
	const router = useRouter();
	const [, startTransition] = useTransition();
	const [busy, setBusy] = useState<string | null>(null);
	const [adding, setAdding] = useState(false);
	const [targetId, setTargetId] = useState('');
	const [targetRole, setTargetRole] = useState<TeamRole>('viewer');
	const relativeTime = useRelativeTime();

	const at = now === undefined ? new Date() : new Date(now);
	const members = team.seats.map(toTeamMember);
	const options = assignableRoles(catalog, team.viewerRole);
	const canManage = can(catalog, team.viewerRole, 'team.manage');
	const idLooksRight = isSnowflake(targetId);

	const refresh = (): void => {
		startTransition(() => {
			router.refresh();
		});
	};

	const changeRole = async (userId: string, name: string, role: TeamRole): Promise<void> => {
		setBusy(userId);
		const result = await putSeat(guildId, userId, role);
		setBusy(null);

		if (result.status === 'error') {
			toast.error(result.message);
			return;
		}

		toast.success(t('access.changed', { name, role: t(`role.${role}`) }));
		refresh();
	};

	const remove = async (userId: string, name: string): Promise<void> => {
		setBusy(userId);
		const result = await deleteSeat(guildId, userId);
		setBusy(null);

		if (result.status === 'error') {
			toast.error(result.message);
			return;
		}

		toast.success(t('access.removed', { name }));
		refresh();
	};

	const add = async (): Promise<void> => {
		setBusy('add');
		const result = await putSeat(guildId, targetId.trim(), targetRole);
		setBusy(null);

		if (result.status === 'error') {
			toast.error(result.message);
			return;
		}

		toast.success(
			t('access.added', {
				name: result.seat.globalName ?? result.seat.username,
				role: t(`role.${result.seat.role}`)
			}),
			{ description: t('access.addedHint') }
		);
		closeDialog(false);
		refresh();
	};

	const closeDialog = (open: boolean): void => {
		setAdding(open);

		if (!open) {
			setTargetId('');
			setTargetRole('viewer');
		}
	};

	const copyAddress = (): void => {
		void navigator.clipboard.writeText(`${window.location.origin}${guildHref(guildId, '')}`).then(
			() => {
				toast.success(t('access.addressCopied'));
			},
			() => {
				toast.error(t('access.copyRefused'));
			}
		);
	};

	return (
		<div className="w-full p-6 sm:p-8">
			<PageHeader
				title={t('title')}
				description={t('description')}
				action={
					<Button
						disabled={!canManage}
						onClick={() => {
							closeDialog(true);
						}}
					>
						<UserPlus aria-hidden="true" />
						{t('add')}
					</Button>
				}
			/>

			<div className="mt-6 flex flex-col gap-6">
				<Alert variant="info" title={t('discordTitle')}>
					{t.rich('discordBody', {
						role: t('role.admin'),
						b: (chunks) => <strong>{chunks}</strong>
					})}{' '}
					{t('discordTail', { brand: BRAND.name })}
				</Alert>

				<SettingsSection
					title={t('access.title')}
					description={t('access.description', { count: members.length })}
				>
					<div className="overflow-x-auto">
						<table className="w-full min-w-180 border-collapse text-left">
							<thead>
								<tr className="border-b border-border text-overline text-text-muted uppercase">
									<th className="py-2 pr-4 font-mono font-semibold">{t('access.person')}</th>
									<th className="py-2 pr-4 font-mono font-semibold">{t('access.seat')}</th>
									<th className="py-2 pr-4 font-mono font-semibold">{t('access.grantedBy')}</th>
									<th className="py-2 pr-4 font-mono font-semibold">{t('access.lastSeen')}</th>
									<th className="w-24 py-2 font-mono font-semibold" />
								</tr>
							</thead>
							<tbody>
								{members.map((member) => {
									const fixed = isFixedSeat(member, team.viewerId);

									return (
										<tr key={member.id} className="border-b border-border last:border-0">
											<td className="py-3 pr-4">
												<div className="flex items-center gap-2.5">
													<Avatar
														initials={member.initials}
														color={member.color}
														src={member.avatarUrl}
														shape="circle"
														size="sm"
													/>
													<div className="min-w-0">
														<p className="truncate text-body">
															{member.name}
															{member.id === team.viewerId ? (
																<span className="text-text-muted"> {t('access.you')}</span>
															) : null}
														</p>
														<p className="truncate font-mono text-caption font-normal text-text-muted">
															{member.handle}
														</p>
													</div>
												</div>
											</td>
											<td className="py-3 pr-4">
												{fixed || !canManage ? (
													<Badge variant={member.role === 'owner' ? 'primary' : 'outline'}>
														{t(`role.${member.role}`)}
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
															if (!role || role === member.role) return;
															void changeRole(member.id, member.name, role);
														}}
														disabled={busy !== null}
														className="w-36"
													/>
												)}
											</td>
											<td className="py-3 pr-4 text-body-sm text-text-muted">
												{member.grantedBy ?? t('access.fromDiscord')}
												{member.grantedAt === null ? null : (
													<span className="block text-caption font-normal text-text-muted">
														{relativeTime(member.grantedAt, at)}
													</span>
												)}
											</td>
											<td className="py-3 pr-4 text-body-sm whitespace-nowrap text-text-muted">
												{member.lastSeenAt === null
													? t('access.never')
													: relativeTime(member.lastSeenAt, at)}
											</td>
											<td className="py-3">
												{fixed || !canManage ? null : (
													<div className="flex items-center justify-end gap-1">
														<Button
															variant="ghost"
															size="sm"
															iconOnly
															aria-label={t('access.copyAddress', { name: member.name })}
															onClick={copyAddress}
														>
															<Link2 aria-hidden="true" />
														</Button>
														<Button
															variant="ghost-danger"
															size="sm"
															iconOnly
															disabled={busy !== null}
															aria-label={t('access.remove', { name: member.name })}
															onClick={() => {
																void remove(member.id, member.name);
															}}
														>
															<Trash2 aria-hidden="true" />
														</Button>
													</div>
												)}
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				</SettingsSection>

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
				open={adding}
				onOpenChange={closeDialog}
				title={t('dialog.title')}
				description={t('dialog.description')}
				footer={
					<>
						<Button
							variant="ghost"
							onClick={() => {
								closeDialog(false);
							}}
						>
							{common('cancel')}
						</Button>
						<Button
							disabled={busy !== null || !idLooksRight}
							onClick={() => {
								void add();
							}}
						>
							<UserPlus aria-hidden="true" />
							{t('dialog.submit')}
						</Button>
					</>
				}
			>
				<div className="flex flex-col gap-4">
					<Field
						label={t('dialog.userId')}
						hint={t('dialog.userIdHint')}
						error={targetId !== '' && !idLooksRight ? t('dialog.userIdInvalid') : undefined}
					>
						<Input
							value={targetId}
							inputMode="numeric"
							autoComplete="off"
							placeholder={t('dialog.userIdPlaceholder')}
							onChange={(event) => {
								setTargetId(event.target.value);
							}}
						/>
					</Field>

					<Field label={t('dialog.seat')}>
						<Select
							options={options.map((role) => ({ value: role, label: t(`role.${role}`) }))}
							value={targetRole}
							onValueChange={(next) => {
								const role = options.find((entry) => entry === next);
								if (role) setTargetRole(role);
							}}
						/>
					</Field>

					<p className="text-body-sm text-text-muted">
						{t('dialog.grants', {
							role: t(`role.${targetRole}`),
							granted: grantedCount(catalog, targetRole),
							total: catalog.capabilities.length
						})}
					</p>
				</div>
			</Dialog>
		</div>
	);
}
