'use client';

import { Download, RotateCcw, Trash2, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/management/ConfirmDialog';
import { PageHeader } from '@/components/management/PageHeader';
import { SaveBar } from '@/components/modules/SaveBar';
import { SettingsSection } from '@/components/modules/SettingsSection';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Combobox } from '@/components/ui/Combobox';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { avatarLimitLabel, avatarTypesLabel, readAsDataUri, refusalFor } from '@/lib/avatar-file';
import { BRAND } from '@/lib/brand';
import { EMBED_SWATCHES } from '@/lib/discord-colors';
import { removeBot, resetAllModules } from '@/lib/guild-bot-client';
import { useConfigDraft, type SaveOutcome } from '@/lib/hooks/useConfigDraft';
import { SUPPORTED_LOCALES } from '@/lib/locale';
import { toEditableSettings } from '@/lib/settings';
import { patchSettings } from '@/lib/settings-client';
import { timezoneOptions } from '@/lib/timezones';
import type { GuildSettings } from '@/lib/types/management';

type SettingsScreenProps = {
	guildId: string;
	settings: GuildSettings;
	guildName: string;
	botAvatarUrl: string | null;
};

const AVATAR_LIMIT_LABEL = avatarLimitLabel();

export function SettingsScreen({
	guildId,
	settings,
	guildName,
	botAvatarUrl
}: SettingsScreenProps) {
	const t = useTranslations('settings');
	const localeNames = useTranslations('locales');
	const save = useCallback(
		async (next: GuildSettings): Promise<SaveOutcome<GuildSettings>> => {
			const result = await patchSettings(guildId, next);

			return result.status === 'saved'
				? { status: 'saved', saved: toEditableSettings(result.settings) }
				: { status: 'error', message: result.message };
		},
		[guildId]
	);

	const form = useConfigDraft<GuildSettings>(settings, { save });
	const draft = form.draft;
	const timezones = useMemo(() => timezoneOptions(), []);
	const router = useRouter();
	const [confirmingRemoval, setConfirmingRemoval] = useState(false);
	const [removing, setRemoving] = useState(false);
	const [avatarUrl, setAvatarUrl] = useState(botAvatarUrl);
	const [sendingAvatar, setSendingAvatar] = useState(false);
	const filePicker = useRef<HTMLInputElement>(null);

	const sendAvatar = useCallback(
		async (botAvatar: string | null): Promise<void> => {
			setSendingAvatar(true);

			const result = await patchSettings(guildId, { botAvatar });

			setSendingAvatar(false);

			if (result.status === 'error') {
				toast.error(result.message);
				return;
			}

			setAvatarUrl(result.settings.botAvatarUrl);
			toast.success(t(botAvatar === null ? 'appearance.avatarRemoved' : 'appearance.avatarSaved'));
		},
		[guildId, t]
	);

	const chooseAvatar = useCallback(
		(file: File | undefined): void => {
			if (file === undefined) return;

			const refusal = refusalFor(file);

			if (refusal === 'type') {
				toast.error(t('appearance.avatarWrongType'));
				return;
			}

			if (refusal === 'size') {
				toast.error(t('appearance.avatarTooLarge', { limit: AVATAR_LIMIT_LABEL }));
				return;
			}

			void readAsDataUri(file).then(
				(uri) => sendAvatar(uri),
				() => {
					toast.error(t('appearance.avatarWrongType'));
				}
			);
		},
		[sendAvatar, t]
	);

	const leave = useCallback(() => {
		setRemoving(true);

		void removeBot(guildId).then(
			(result) => {
				if (result.status === 'error') {
					setRemoving(false);
					toast.error(t('danger.removeFailed'), { description: result.message });

					return;
				}

				toast.success(t('danger.left', { brand: BRAND.name, guild: guildName }), {
					description: t('danger.leftHint')
				});
				router.push('/servers');
			},
			(error: unknown) => {
				setRemoving(false);
				toast.error(t('danger.removeFailed'), {
					description: error instanceof Error ? error.message : t('unknownFailure')
				});
			}
		);
	}, [guildId, guildName, router, t]);

	const [confirmingReset, setConfirmingReset] = useState(false);
	const [resetting, setResetting] = useState(false);

	const wipe = useCallback(() => {
		setResetting(true);

		void resetAllModules(guildId).then(
			(result) => {
				setResetting(false);

				if (result.status === 'error') {
					toast.error(t('danger.resetFailed'), { description: result.message });

					return;
				}

				setConfirmingReset(false);
				toast.success(t('danger.wasReset'), { description: t('danger.wasResetHint') });
				router.refresh();
			},
			(error: unknown) => {
				setResetting(false);
				toast.error(t('danger.resetFailed'), {
					description: error instanceof Error ? error.message : t('unknownFailure')
				});
			}
		);
	}, [guildId, router, t]);

	return (
		<div className="flex min-h-full w-full flex-col p-6 sm:p-8">
			<PageHeader
				title={t('title')}
				description={t('description', { brand: BRAND.name, guild: guildName })}
			/>

			<div className="mt-6 flex flex-1 flex-col gap-6">
				<SettingsSection title={t('language.title')} description={t('language.description')}>
					<div className="grid gap-4 sm:grid-cols-2">
						<Field label={t('language.serverLanguage')} hint={t('language.serverLanguageHint')}>
							<Select
								options={SUPPORTED_LOCALES.map((value) => ({
									value,
									label: localeNames(value)
								}))}
								value={draft.locale}
								onValueChange={(next) => {
									form.set('locale', next);
								}}
							/>
						</Field>

						<Field label={t('language.timezone')} hint={t('language.timezoneHint')}>
							<Combobox
								options={timezones}
								value={draft.timezone}
								onValueChange={(next) => {
									form.set('timezone', next);
								}}
								placeholder={t('language.timezonePlaceholder')}
								searchPlaceholder={t('language.timezoneSearch')}
								emptyLabel={t('language.timezoneEmpty')}
							/>
						</Field>
					</div>
				</SettingsSection>

				<SettingsSection title={t('appearance.title')} description={t('appearance.description')}>
					<div className="flex flex-col gap-2">
						<span className="text-body-sm font-medium">{t('appearance.embedColor')}</span>
						<div className="flex flex-wrap items-center gap-2">
							{EMBED_SWATCHES.map((color) => (
								<button
									key={color}
									type="button"
									aria-label={t('appearance.useColor', { color })}
									aria-pressed={draft.embedColor.toLowerCase() === color}
									onClick={() => {
										form.set('embedColor', color);
									}}
									className={
										draft.embedColor.toLowerCase() === color
											? 'size-8 rounded-md ring-2 ring-primary ring-offset-2 ring-offset-surface'
											: 'size-8 rounded-md ring-1 ring-border'
									}
									style={{ backgroundColor: color }}
								/>
							))}
							<Input
								value={draft.embedColor}
								onChange={(event) => {
									form.set('embedColor', event.target.value);
								}}
								aria-label={t('appearance.embedColorHex')}
								className="w-28 font-mono"
								maxLength={7}
							/>
						</div>
					</div>

					<Field
						label={t('appearance.nickname')}
						hint={t('appearance.nicknameHint', { brand: BRAND.name })}
					>
						<Input
							value={draft.botNickname}
							onChange={(event) => {
								form.set('botNickname', event.target.value);
							}}
							placeholder={BRAND.name}
							className="max-w-80"
						/>
					</Field>
					<Field
						label={t('appearance.avatar')}
						hint={t('appearance.avatarHint', {
							types: avatarTypesLabel(),
							limit: AVATAR_LIMIT_LABEL
						})}
					>
						<div className="flex items-center gap-4">
							{avatarUrl === null ? (
								<span className="text-muted-foreground grid size-16 shrink-0 place-items-center rounded-full border border-dashed text-[11px]">
									{BRAND.name.slice(0, 2).toUpperCase()}
								</span>
							) : (
								<img
									src={avatarUrl}
									alt=""
									className="size-16 shrink-0 rounded-full object-cover"
								/>
							)}

							<div className="flex flex-wrap items-center gap-2">
								<input
									ref={filePicker}
									type="file"
									accept="image/png,image/jpeg,image/gif"
									className="hidden"
									aria-label={t('appearance.avatar')}
									onChange={(event) => {
										chooseAvatar(event.target.files?.[0]);
										event.target.value = '';
									}}
								/>
								<Button
									type="button"
									variant="secondary"
									disabled={sendingAvatar}
									onClick={() => filePicker.current?.click()}
								>
									<Upload className="size-4" />
									{t(avatarUrl === null ? 'appearance.avatarChoose' : 'appearance.avatarReplace')}
								</Button>

								{avatarUrl === null ? (
									<span className="text-muted-foreground text-xs">
										{t('appearance.avatarEmpty')}
									</span>
								) : (
									<Button
										type="button"
										variant="ghost"
										disabled={sendingAvatar}
										onClick={() => {
											void sendAvatar(null);
										}}
									>
										<Trash2 className="size-4" />
										{t('appearance.avatarRemove')}
									</Button>
								)}
							</div>
						</div>
					</Field>
				</SettingsSection>

				<SettingsSection title={t('backup.title')} description={t('backup.description')}>
					<ActionRow
						pending
						title={t('backup.exportTitle')}
						body={t('backup.exportBody')}
						pendingLabel={t('notAvailable')}
						action={
							<Button variant="outline" size="sm" disabled>
								<Download aria-hidden="true" />
								{t('backup.export')}
							</Button>
						}
					/>

					<ActionRow
						pending
						title={t('backup.importTitle')}
						body={t('backup.importBody')}
						pendingLabel={t('notAvailable')}
						action={
							<Button variant="outline" size="sm" disabled>
								<Upload aria-hidden="true" />
								{t('backup.import')}
							</Button>
						}
					/>
				</SettingsSection>

				<SettingsSection title={t('danger.title')} description={t('danger.description')} danger>
					<ActionRow
						title={t('danger.resetTitle')}
						body={t('danger.resetBody')}
						action={
							<Button
								variant="danger"
								size="sm"
								loading={resetting}
								onClick={() => {
									setConfirmingReset(true);
								}}
							>
								<RotateCcw aria-hidden="true" />
								{t('danger.reset')}
							</Button>
						}
					/>

					<ActionRow
						title={t('danger.removeTitle', { brand: BRAND.name, guild: guildName })}
						body={t('danger.removeBody')}
						action={
							<Button
								variant="danger"
								size="sm"
								loading={removing}
								onClick={() => {
									setConfirmingRemoval(true);
								}}
							>
								<Trash2 aria-hidden="true" />
								{t('danger.remove')}
							</Button>
						}
					/>
				</SettingsSection>
			</div>

			<ConfirmDialog
				open={confirmingRemoval}
				onOpenChange={setConfirmingRemoval}
				title={t('danger.confirmTitle', { brand: BRAND.name, guild: guildName })}
				description={t('danger.confirmDescription')}
				confirmPhrase={guildName}
				confirmLabel={t('danger.confirmLabel')}
				onConfirm={leave}
			>
				<p className="text-body-sm text-text-muted">{t('danger.confirmBody')}</p>
			</ConfirmDialog>

			<ConfirmDialog
				open={confirmingReset}
				onOpenChange={setConfirmingReset}
				title={t('danger.resetConfirmTitle', { guild: guildName })}
				description={t('danger.resetConfirmDescription')}
				confirmPhrase={guildName}
				confirmLabel={t('danger.resetConfirmLabel')}
				onConfirm={wipe}
			>
				<p className="text-body-sm text-text-muted">{t('danger.resetConfirmBody')}</p>
			</ConfirmDialog>

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
		</div>
	);
}

function ActionRow({
	title,
	body,
	action,
	pending = false,
	pendingLabel
}: {
	title: string;
	body: string;
	action: ReactNode;
	pending?: boolean;
	pendingLabel?: string;
}) {
	return (
		<div className="flex flex-wrap items-start gap-3 border-b border-border pb-4 last:border-0 last:pb-0">
			<div className="min-w-60 flex-1">
				<div className="flex flex-wrap items-center gap-2">
					<p className="text-body font-medium">{title}</p>
					{pending ? <Badge variant="neutral">{pendingLabel}</Badge> : null}
				</div>
				<p className="text-body-sm text-pretty text-text-muted">{body}</p>
			</div>
			<div className="shrink-0">{action}</div>
		</div>
	);
}
