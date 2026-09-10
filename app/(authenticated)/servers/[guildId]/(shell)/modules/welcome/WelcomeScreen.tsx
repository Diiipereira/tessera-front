'use client';

import { DoorOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { channelSwitch } from '@/lib/channel-switch';
import { useCallback, useRef, useState } from 'react';
import { DiscordPreview } from '@/components/modules/DiscordPreview';
import { FieldHelp } from '@/components/modules/FieldHelp';
import { MessageComposer } from '@/components/modules/MessageComposer';
import { ModulePage } from '@/components/modules/ModulePage';
import { SaveBar } from '@/components/modules/SaveBar';
import { SettingsSection } from '@/components/modules/SettingsSection';
import { ChannelPicker } from '@/components/discord/ChannelPicker';
import { RolePicker } from '@/components/discord/RolePicker';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';
import { useConfigDraft, type SaveOutcome } from '@/lib/hooks/useConfigDraft';
import { MODULE_HELP } from '@/lib/module-help';
import { patchModule, sendModuleTest } from '@/lib/module-client';
import {
	WELCOME_AUTO_ROLES_MAX,
	WELCOME_CHANNEL_KINDS,
	WELCOME_DELETE_AFTER_MAX,
	toWelcomeConfig,
	toWelcomePatch
} from '@/lib/modules/welcome';
import type { Channel, Role } from '@/lib/types/discord';
import type { MessageVariable, WelcomeConfig, WelcomePingMode } from '@/lib/types/modules';
import { toast } from 'sonner';

const PING_MODES: WelcomePingMode[] = ['none', 'inline', 'ghost'];

const DELETE_AFTER: { value: string; key: string }[] = [
	{ value: '0', key: 'keep' },
	{ value: '30', key: 'seconds30' },
	{ value: '60', key: 'minutes1' },
	{ value: '300', key: 'minutes5' },
	{ value: '3600', key: 'hours1' },
	{ value: String(WELCOME_DELETE_AFTER_MAX), key: 'days1' }
];

type WelcomeScreenProps = {
	guildId: string;
	config: WelcomeConfig;
	defaultColor: string;
	version: number;
	channels: Channel[];
	roles: Role[];
	variables: MessageVariable[];
	botName: string;
	botAvatarUrl: string | null;
};

export function WelcomeScreen({
	guildId,
	config,
	defaultColor,
	version,
	channels,
	roles,
	variables,
	botName,
	botAvatarUrl
}: WelcomeScreenProps) {
	const t = useTranslations('modules.welcome');
	const previewText = useTranslations('modules.preview');
	const switchText = useTranslations('channelSwitch');
	const versionRef = useRef(version);

	const save = useCallback(
		async (next: WelcomeConfig): Promise<SaveOutcome<WelcomeConfig>> => {
			const result = await patchModule(guildId, 'welcome', {
				version: versionRef.current,
				enabled: next.enabled,
				config: toWelcomePatch(next)
			});

			if (result.status === 'error') return result;

			versionRef.current = result.state.version;

			return result.status === 'saved'
				? { status: 'saved', saved: toWelcomeConfig(result.state, defaultColor) }
				: { status: 'conflict', current: toWelcomeConfig(result.state, defaultColor) };
		},
		[guildId, defaultColor]
	);

	const form = useConfigDraft<WelcomeConfig>(config, { save });
	const [testing, setTesting] = useState(false);

	const runTest = useCallback(async () => {
		setTesting(true);

		const result = await sendModuleTest(guildId, 'welcome');

		setTesting(false);

		if (result.status === 'error') {
			toast.error(t('test.failed'), { description: result.message });
			return;
		}

		if (result.outcome === 'sent') {
			toast.success(t('test.sent'));
			return;
		}

		toast.warning(t(result.outcome === 'not-ready' ? 'test.notReady' : 'test.channelRefused'));
	}, [guildId, t]);
	const draft = form.draft;
	const switching = channelSwitch(form.saved.channelId, draft.channelId, channels);

	const preview = (
		<section
			aria-label={previewText('title')}
			className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-1"
		>
			<h2 className="min-w-0 truncate text-h4">{previewText('title')}</h2>

			<DiscordPreview
				message={draft.message}
				variables={variables}
				botName={botName}
				botAvatarUrl={botAvatarUrl}
			/>

			<p className="text-caption font-normal text-text-muted">{t('previewNote')}</p>
		</section>
	);

	return (
		<ModulePage
			moduleId="welcome"
			icon={DoorOpen}
			title={t('title')}
			description={t('description')}
			enabled={draft.enabled}
			onEnabledChange={(next) => {
				form.set('enabled', next);
			}}
			headerAction={
				<Button
					variant="outline"
					size="sm"
					loading={testing}
					disabled={form.dirty}
					title={form.dirty ? t('test.dirty') : undefined}
					onClick={() => {
						void runTest();
					}}
				>
					{t('test.action')}
				</Button>
			}
			aside={preview}
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
			<SettingsSection title={t('message.title')} description={t('message.description')}>
				<Field
					label={t('message.channel')}
					hint={t('message.channelHint')}
					{...(switching.kind === 'none'
						? {}
						: {
								help: `${switchText(switching.kind, { ...switching })}${
									draft.enabled ? '' : ` ${switchText('moduleOff')}`
								}`
							})}
				>
					<ChannelPicker
						channels={channels}
						kinds={WELCOME_CHANNEL_KINDS}
						value={draft.channelId}
						onValueChange={(next) => {
							form.set('channelId', next);
						}}
					/>
				</Field>

				<MessageComposer
					value={draft.message}
					onChange={(next) => {
						form.set('message', next);
					}}
					variables={variables}
				/>

				{draft.message.mode === 'text' && draft.message.text.trim() === '' ? (
					<p className="text-caption font-normal text-text-muted">{t('message.emptyHint')}</p>
				) : null}
			</SettingsSection>

			<SettingsSection title={t('mention.title')} description={t('mention.description')}>
				<Field
					label={t('mention.label')}
					hint={t(`mention.${draft.pingMode}Hint`)}
					action={<FieldHelp {...MODULE_HELP.welcomeMention} />}
				>
					<Select
						value={draft.pingMode}
						onValueChange={(next) => {
							form.set('pingMode', next as WelcomePingMode);
						}}
						options={PING_MODES.map((mode) => ({ value: mode, label: t(`mention.${mode}`) }))}
					/>
				</Field>
			</SettingsSection>

			<SettingsSection
				title={t('autorole.title')}
				description={t('autorole.description', { max: WELCOME_AUTO_ROLES_MAX })}
			>
				<Field
					label={t('autorole.label')}
					hint={t('autorole.labelHint')}
					action={<FieldHelp {...MODULE_HELP.welcomeAutorole} />}
				>
					<RolePicker
						roles={roles}
						value={draft.autoRoleIds}
						max={WELCOME_AUTO_ROLES_MAX}
						onValueChange={(next) => {
							form.set('autoRoleIds', next);
						}}
					/>
				</Field>
			</SettingsSection>

			<SettingsSection title={t('cleanup.title')} description={t('cleanup.description')}>
				<Field
					label={t('cleanup.label')}
					hint={t('cleanup.labelHint')}
					action={<FieldHelp {...MODULE_HELP.welcomeCleanup} />}
				>
					<Select
						value={String(draft.deleteAfter ?? 0)}
						onValueChange={(next) => {
							form.set('deleteAfter', Number(next) === 0 ? null : Number(next));
						}}
						options={DELETE_AFTER.map((option) => ({
							value: option.value,
							label: t(`cleanup.${option.key}`)
						}))}
					/>
				</Field>
			</SettingsSection>
		</ModulePage>
	);
}
