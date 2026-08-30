'use client';

import { ShieldAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useRef } from 'react';
import { ChannelPicker } from '@/components/discord/ChannelPicker';
import { RolePicker } from '@/components/discord/RolePicker';
import { ModulePage } from '@/components/modules/ModulePage';
import { SaveBar } from '@/components/modules/SaveBar';
import { SettingsSection } from '@/components/modules/SettingsSection';
import { Alert } from '@/components/ui/Alert';
import { Checkbox } from '@/components/ui/Checkbox';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { useConfigDraft, type SaveOutcome } from '@/lib/hooks/useConfigDraft';
import { patchModule } from '@/lib/module-client';
import {
	AUTO_ACTIONS,
	MAX_APPEAL_URL_LENGTH,
	MAX_DM_EXTRA_LENGTH,
	MAX_PURGE_DAYS,
	MODERATION_LOG_CHANNEL_KINDS,
	TIMEOUT_KEYS,
	asTimeoutKey,
	asWindowDays,
	escalationIsUnreachable,
	toModerationConfig,
	toModerationPatch,
	type ModerationConfig
} from '@/lib/modules/moderation';
import type { Channel, Role } from '@/lib/types/discord';
import { LadderEditor } from './LadderEditor';
import { toast } from 'sonner';

const PURGE_DAYS = Array.from({ length: MAX_PURGE_DAYS + 1 }, (_, day) => day);

export type ModerationScreenProps = {
	guildId: string;
	guildName: string;
	config: ModerationConfig;
	version: number;
	channels: Channel[];
	roles: Role[];
};

export function ModerationScreen({
	guildId,
	guildName,
	config,
	version,
	channels,
	roles
}: ModerationScreenProps) {
	const t = useTranslations('modules.moderation');
	const shared = useTranslations('modules');
	const durations = useTranslations('durations');
	const actions = useTranslations('cases.action');
	const versionRef = useRef(version);

	const save = useCallback(
		async (next: ModerationConfig): Promise<SaveOutcome<ModerationConfig>> => {
			const result = await patchModule(guildId, 'moderation', {
				version: versionRef.current,
				enabled: next.enabled,
				config: toModerationPatch(next)
			});

			if (result.status === 'error') return result;

			versionRef.current = result.state.version;

			return result.status === 'saved'
				? { status: 'saved', saved: toModerationConfig(result.state) }
				: { status: 'conflict', current: toModerationConfig(result.state) };
		},
		[guildId]
	);

	const form = useConfigDraft<ModerationConfig>(config, { save });
	const draft = form.draft;

	const purgeOptions = PURGE_DAYS.map((day) => ({
		value: String(day),
		label: t('defaults.days', { count: day })
	}));

	return (
		<ModulePage
			moduleId="moderation"
			icon={ShieldAlert}
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
						void form.save().then(
							(state) => {
								if (state === 'idle') toast.success(t('saved'));
							},
							(error: unknown) => {
								toast.error(t('saveFailed'), {
									description: error instanceof Error ? error.message : t('unknownFailure')
								});
							}
						);
					}}
					onResolveConflict={form.resolveConflict}
				/>
			}
		>
			<SettingsSection title={t('log.title')} description={t('log.description')}>
				<Field label={t('log.channel')} hint={t('log.channelHint')}>
					<ChannelPicker
						channels={channels}
						kinds={MODERATION_LOG_CHANNEL_KINDS}
						value={draft.logChannelId}
						onValueChange={(next) => {
							form.set('logChannelId', next);
						}}
					/>
				</Field>
			</SettingsSection>

			<SettingsSection title={t('muted.title')} description={t('muted.description')}>
				<Field label={t('muted.role')} hint={t('muted.roleHint')}>
					<RolePicker
						roles={roles}
						value={draft.mutedRoleId === null ? [] : [draft.mutedRoleId]}
						onValueChange={(next) => {
							form.set('mutedRoleId', next[0] ?? null);
						}}
					/>
				</Field>
			</SettingsSection>

			<SettingsSection title={t('protected.title')} description={t('protected.description')}>
				<Field label={t('protected.roles')} hint={t('protected.rolesHint')}>
					<RolePicker
						roles={roles}
						value={draft.protectedRoleIds}

						placeholder={t('protected.placeholder')}
						onValueChange={(next) => {
							form.set('protectedRoleIds', next);
						}}
					/>
				</Field>

				<p className="text-caption font-normal text-text-muted">{t('protected.reversalNote')}</p>
			</SettingsSection>

			<SettingsSection title={t('defaults.title')} description={t('defaults.description')}>
				<Field label={t('defaults.timeout')} hint={t('defaults.timeoutHint')}>
					<Select
						options={TIMEOUT_KEYS.map((key) => ({ value: key, label: durations(key) }))}
						value={draft.timeoutDefault}
						onValueChange={(next) => {
							form.set('timeoutDefault', asTimeoutKey(next));
						}}
						className="w-56"
					/>
				</Field>

				<Field label={t('defaults.banPurge')} hint={t('defaults.banPurgeHint')}>
					<Select
						options={purgeOptions}
						value={String(draft.banPurgeDays)}
						onValueChange={(next) => {
							form.set('banPurgeDays', Number(next));
						}}
						className="w-56"
					/>
				</Field>

				<Field label={t('defaults.softbanPurge')} hint={t('defaults.softbanPurgeHint')}>
					<Select
						options={purgeOptions}
						value={String(draft.softbanPurgeDays)}
						onValueChange={(next) => {
							form.set('softbanPurgeDays', Number(next));
						}}
						className="w-56"
					/>
				</Field>

				<Switch
					checked={draft.requireReason}
					onCheckedChange={(next) => {
						form.set('requireReason', next);
					}}
					label={t('defaults.requireReason')}
					description={t('defaults.requireReasonHint')}
				/>
			</SettingsSection>

			<SettingsSection title={t('dm.title')} description={t('dm.description')}>
				<Switch
					checked={draft.dmOnAction}
					onCheckedChange={(next) => {
						form.set('dmOnAction', next);
					}}
					label={t('dm.toggle')}
					description={t('dm.toggleHint')}
				/>

				{draft.dmOnAction ? (
					<>
						<div className="rounded-lg border border-border bg-surface-sunken p-3">
							<p className="text-overline text-text-muted uppercase">{t('dm.preview')}</p>
							<p className="mt-1 text-body-sm">{t('dm.previewLead', { server: guildName })}</p>
							<p className="text-body-sm">{t('dm.previewReason')}</p>
							{draft.dmExtra.trim() === '' ? null : (
								<p className="mt-2 text-body-sm whitespace-pre-wrap">{draft.dmExtra}</p>
							)}
							{draft.appealUrl.trim() === '' ? null : (
								<p className="mt-2 truncate text-body-sm">{draft.appealUrl}</p>
							)}
						</div>

						<Field label={t('dm.extra')} hint={t('dm.extraHint')}>
							<Textarea
								value={draft.dmExtra}
								maxLength={MAX_DM_EXTRA_LENGTH}
								rows={3}
								placeholder={t('dm.extraPlaceholder')}
								onChange={(event) => {
									form.set('dmExtra', event.target.value);
								}}
							/>
						</Field>

						<Field label={t('dm.appeal')} hint={t('dm.appealHint')}>
							<Input
								type="url"
								value={draft.appealUrl}
								maxLength={MAX_APPEAL_URL_LENGTH}
								onChange={(event) => {
									form.set('appealUrl', event.target.value);
								}}
							/>
						</Field>
					</>
				) : null}
			</SettingsSection>

			<SettingsSection title={t('escalation.title')} description={t('escalation.description')}>
				<Field label={t('escalation.auto')} hint={t('escalation.autoHint')}>
					<div className="flex flex-wrap gap-x-6 gap-y-2">
						{AUTO_ACTIONS.map((action) => (
							<Checkbox
								key={action}
								checked={draft.escalationAutoActions.includes(action)}
								onCheckedChange={(next: boolean | 'indeterminate') => {
									form.set(
										'escalationAutoActions',
										next === true
											? AUTO_ACTIONS.filter(
													(entry) => entry === action || draft.escalationAutoActions.includes(entry)
												)
											: draft.escalationAutoActions.filter((entry) => entry !== action)
									);
								}}
								label={actions(action)}
							/>
						))}
					</div>
				</Field>

				<Field label={t('escalation.channel')} hint={t('escalation.channelHint')}>
					<ChannelPicker
						channels={channels}
						kinds={MODERATION_LOG_CHANNEL_KINDS}
						value={draft.escalationChannelId}
						onValueChange={(next) => {
							form.set('escalationChannelId', next);
						}}
					/>
				</Field>

				<Field label={t('escalation.ping')} hint={t('escalation.pingHint')}>
					<RolePicker
						roles={roles}
						value={draft.escalationPingRoleIds}

						placeholder={t('escalation.pingPlaceholder')}
						onValueChange={(next) => {
							form.set('escalationPingRoleIds', next);
						}}
					/>
				</Field>

				{escalationIsUnreachable(draft) ? (
					<Alert variant="warning" title={shared('disabled')}>
						{t('escalation.unreachable')}
					</Alert>
				) : null}

				<Field label={t('escalation.window')} hint={t('escalation.windowHint')} className="w-40">
					<Input
						value={String(draft.escalationWindowDays)}
						inputMode="numeric"
						onChange={(event) => {
							form.set('escalationWindowDays', asWindowDays(Number(event.target.value)));
						}}
					/>
				</Field>

				<LadderEditor guildId={guildId} canWrite={true} />

				<p className="text-caption font-normal text-text-muted">{t('escalation.protectedNote')}</p>
				<p className="text-caption font-normal text-text-muted">{t('escalation.notBuilt')}</p>
			</SettingsSection>
		</ModulePage>
	);
}
