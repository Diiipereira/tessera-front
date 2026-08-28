'use client';

import { Shield, Wand2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { RolePicker } from '@/components/discord/RolePicker';
import { EscalationTable } from '@/components/modules/EscalationTable';
import { ModulePage } from '@/components/modules/ModulePage';
import { SaveBar } from '@/components/modules/SaveBar';
import { SettingsSection } from '@/components/modules/SettingsSection';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { useConfigDraft } from '@/lib/hooks/useConfigDraft';
import type { Role } from '@/lib/types/discord';
import type { ModerationConfig } from '@/lib/types/modules';

const TIMEOUT_DURATIONS = ['60s', '5m', '1h', '24h', '7d'] as const;

const MUTE_DURATIONS = ['1h', '24h', '7d'] as const;

const DELETE_DAYS = [
	{ value: '0', key: 'keepMessages' },
	{ value: '1', key: 'delete1' },
	{ value: '7', key: 'delete7' }
] as const;

type ModerationScreenProps = {
	config: ModerationConfig;
	roles: Role[];
};

export function ModerationScreen({ config, roles }: ModerationScreenProps) {
	const t = useTranslations('modules.moderation');
	const spans = useTranslations('durations');
	const form = useConfigDraft<ModerationConfig>(config);
	const draft = form.draft;

	const mutedRole = roles.find((role) => role.id === draft.mutedRoleId);

	return (
		<ModulePage
			moduleId="moderation"
			icon={Shield}
			title={t('title')}
			description={t('description')}
			enabled={draft.enabled}
			onEnabledChange={(next) => {
				form.set('enabled', next);
			}}
			saveBar={
				<SaveBar
					dirty={form.dirty}
					changedCount={form.changedCount}
					state={form.state}
					onDiscard={form.discard}
					onSave={() => {
						void form.save().then(() => {
							toast.success(t('saved'));
						});
					}}
					onResolveConflict={form.resolveConflict}
				/>
			}
		>
			<SettingsSection title={t('who.title')} description={t('who.description')}>
				<Field label={t('who.modRoles')} hint={t('who.modRolesHint')}>
					<RolePicker
						roles={roles}
						value={draft.modRoleIds}
						onValueChange={(next) => {
							form.set('modRoleIds', next);
						}}
						placeholder={t('who.modRolesPlaceholder')}
					/>
				</Field>

				<Field label={t('who.protectedRoles')} hint={t('who.protectedRolesHint')}>
					<RolePicker
						roles={roles}
						value={draft.protectedRoleIds}
						onValueChange={(next) => {
							form.set('protectedRoleIds', next);
						}}
						placeholder={t('who.protectedRolesPlaceholder')}
					/>
				</Field>
			</SettingsSection>

			<SettingsSection title={t('muted.title')} description={t('muted.description')}>
				{mutedRole ? (
					<Field label={t('muted.role')}>
						<RolePicker
							roles={roles}
							value={[mutedRole.id]}
							onValueChange={(next) => {
								form.set('mutedRoleId', next.at(-1) ?? null);
							}}
						/>
					</Field>
				) : (
					<Alert variant="warning" title={t('muted.noneTitle')}>
						{t('muted.noneBody')}
						<div className="mt-3">
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									const created = roles.find((role) => !role.lockedReason);
									if (!created) return;
									form.set('mutedRoleId', created.id);
									toast.success(t('muted.using', { role: created.name }), {
										description: t('muted.usingHint')
									});
								}}
							>
								<Wand2 aria-hidden="true" />
								{t('muted.create')}
							</Button>
						</div>
					</Alert>
				)}
			</SettingsSection>

			<SettingsSection title={t('defaults.title')} description={t('defaults.description')}>
				<Field label={t('defaults.timeout')}>
					<Select
						options={TIMEOUT_DURATIONS.map((value) => ({ value, label: spans(value) }))}
						value={draft.timeoutDefault}
						onValueChange={(next) => {
							form.set('timeoutDefault', next);
						}}
					/>
				</Field>

				<Field label={t('defaults.mute')}>
					<Select
						options={[
							...MUTE_DURATIONS.map((value) => ({ value, label: spans(value) })),
							{ value: 'permanent', label: t('defaults.untilLifted') }
						]}
						value={draft.muteDefault}
						onValueChange={(next) => {
							form.set('muteDefault', next);
						}}
					/>
				</Field>

				<Field label={t('defaults.onBan')} hint={t('defaults.onBanHint')}>
					<Select
						options={DELETE_DAYS.map((option) => ({
							value: option.value,
							label: t(`defaults.${option.key}`)
						}))}
						value={draft.banDeleteDays}
						onValueChange={(next) => {
							form.set('banDeleteDays', next);
						}}
					/>
				</Field>

				<Switch
					checked={draft.reasonRequired}
					onCheckedChange={(next) => {
						form.set('reasonRequired', next);
					}}
					label={t('defaults.reasonRequired')}
					description={t('defaults.reasonRequiredHint')}
				/>
			</SettingsSection>

			<SettingsSection title={t('dm.title')} description={t('dm.description')}>
				<Switch
					checked={draft.dmOnPunish}
					onCheckedChange={(next) => {
						form.set('dmOnPunish', next);
					}}
					label={t('dm.toggle')}
					description={t('dm.toggleHint')}
				/>

				{draft.dmOnPunish ? (
					<>
						<Field label={t('dm.message')} hint={t('dm.messageHint')}>
							<Textarea
								value={draft.dmTemplate}
								onChange={(event) => {
									form.set('dmTemplate', event.target.value);
								}}
								maxLength={1000}
								showCount
							/>
						</Field>

						<Field label={t('dm.appeal')} help={t('dm.appealHelp')}>
							<Input
								type="url"
								value={draft.appealUrl}
								onChange={(event) => {
									form.set('appealUrl', event.target.value);
								}}
								placeholder="https://"
							/>
						</Field>
					</>
				) : null}
			</SettingsSection>

			<SettingsSection title={t('escalation.title')} description={t('escalation.description')}>
				<EscalationTable
					rules={draft.escalation}
					onChange={(next) => {
						form.set('escalation', next);
					}}
				/>
			</SettingsSection>
		</ModulePage>
	);
}
