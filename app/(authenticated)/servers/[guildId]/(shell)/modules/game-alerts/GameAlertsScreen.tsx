'use client';

import { ExternalLink, Gamepad2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ChannelPicker } from '@/components/discord/ChannelPicker';
import { RolePicker } from '@/components/discord/RolePicker';
import { DiscordPreview } from '@/components/modules/DiscordPreview';
import { DiscordPreviewSkeleton } from '@/components/modules/ModuleSkeleton';
import { ModulePage } from '@/components/modules/ModulePage';
import { SaveBar } from '@/components/modules/SaveBar';
import { SettingsSection } from '@/components/modules/SettingsSection';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Switch } from '@/components/ui/Switch';
import { DISCORD } from '@/lib/discord-colors';
import {
	previewGameAlert,
	sendGameAlertTest,
	type GameAlertPreviewDto,
	type GameAlertTestOutcome
} from '@/lib/game-alerts-client';
import { useApiFailure, useThrownFailure } from '@/lib/hooks/useApiFailure';
import { useConfigDraft, type SaveOutcome } from '@/lib/hooks/useConfigDraft';
import { patchModule } from '@/lib/module-client';
import {
	GAME_ALERT_CHANNEL_KINDS,
	GAME_ALERT_PING_ROLES_MAX,
	GAME_STORES,
	STORE_NAMES,
	discordTokens,
	previewShape,
	previewTextOf,
	toGameAlertsConfig,
	toGameAlertsPatch,
	toPreviewBody,
	toggleStore,
	type PreviewLink
} from '@/lib/modules/game-alerts';
import type { Channel, Role } from '@/lib/types/discord';
import type { GameAlertsConfig } from '@/lib/types/module-configs';

const PREVIEW_DELAY_MS = 400;

const TEST_WARNINGS: Record<Exclude<GameAlertTestOutcome, 'sent'>, string> = {
	'sent-as-bot': 'test.sentAsBot',
	'not-ready': 'test.notReady',
	'no-offer': 'test.noOffer',
	'channel-refused': 'test.channelRefused'
};

type GameAlertsScreenProps = {
	guildId: string;
	config: GameAlertsConfig;
	version: number;
	channels: Channel[];
	roles: Role[];
};

function ClaimLinks({ links }: { links: PreviewLink[] }) {
	return (
		<div className="flex flex-wrap gap-2">
			{links.map((link) => (
				<a
					key={link.url}
					href={link.url}
					target="_blank"
					rel="noreferrer"
					className="inline-flex h-8 items-center gap-1.5 rounded-[3px] px-3 text-[14px] font-medium text-white"
					style={{ backgroundColor: DISCORD.button }}
				>
					{link.label}
					<ExternalLink aria-hidden="true" className="size-4" />
				</a>
			))}
		</div>
	);
}

export function GameAlertsScreen({
	guildId,
	config,
	version,
	channels,
	roles
}: GameAlertsScreenProps) {
	const t = useTranslations('modules.gameAlerts');
	const previewText = useTranslations('modules.preview');
	const locale = useLocale();
	const describe = useApiFailure();
	const explain = useThrownFailure();
	const versionRef = useRef(version);
	const [preview, setPreview] = useState<GameAlertPreviewDto | null>(null);
	const [previewFailed, setPreviewFailed] = useState(false);
	const [testing, setTesting] = useState(false);

	const save = useCallback(
		async (next: GameAlertsConfig): Promise<SaveOutcome<GameAlertsConfig>> => {
			const result = await patchModule(guildId, 'game-alerts', {
				version: versionRef.current,
				enabled: next.enabled,
				config: toGameAlertsPatch(next)
			});

			if (result.status === 'error') return result;

			versionRef.current = result.state.version;

			return result.status === 'saved'
				? { status: 'saved', saved: toGameAlertsConfig(result.state) }
				: { status: 'conflict', current: toGameAlertsConfig(result.state) };
		},
		[guildId]
	);

	const form = useConfigDraft<GameAlertsConfig>(config, { save });
	const draft = form.draft;
	const body = useMemo(() => toPreviewBody(draft), [draft]);

	useEffect(() => {
		const controller = new AbortController();
		const timer = setTimeout(() => {
			void previewGameAlert(guildId, body, controller.signal).then((result) => {
				if (controller.signal.aborted) return;

				setPreviewFailed(result.status === 'error');

				if (result.status === 'ok') setPreview(result.preview);
			});
		}, PREVIEW_DELAY_MS);

		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	}, [guildId, body]);

	const runTest = useCallback(async () => {
		setTesting(true);

		const result = await sendGameAlertTest(guildId);

		setTesting(false);

		if (result.status === 'error') {
			toast.error(t('test.failed'), { description: describe(result.failure) });
			return;
		}

		if (result.outcome === 'sent') {
			toast.success(t('test.sent'));
			return;
		}

		toast.warning(t(TEST_WARNINGS[result.outcome]));
	}, [guildId, t, describe]);

	const absolute = (moment: Date): string =>
		new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeStyle: 'short' }).format(moment);
	const footerStamp = (moment: Date): string =>
		new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' }).format(moment);
	const shape = preview === null ? null : previewShape(preview);
	const nothingFree = preview !== null && preview.running.length === 0;
	const manyFree = preview !== null && preview.running.length > 1;
	const tokens =
		preview === null
			? []
			: discordTokens(previewTextOf(preview), {
					roleName: (id) => roles.find((role) => role.id === id)?.name ?? null,
					unknownRole: t('preview.unknownRole'),
					absolute
				});

	const aside = (
		<section
			aria-label={previewText('title')}
			className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-1"
		>
			<h2 className="min-w-0 truncate text-h4">{previewText('title')}</h2>

			{previewFailed ? (
				<p className="text-body-sm text-danger-fg">{t('preview.failed')}</p>
			) : preview === null ? (
				<DiscordPreviewSkeleton embed link />
			) : shape === null ? (
				<p className="text-body-sm text-text-muted">{t('preview.none')}</p>
			) : (
				<DiscordPreview
					message={shape.message}
					lead={shape.lead}
					variables={tokens}
					botName={preview.sender.name}
					botAvatarUrl={preview.sender.avatarUrl}
					embedTimestampLabel={shape.nextUpAt === null ? null : footerStamp(shape.nextUpAt)}
					footer={shape.links.length === 0 ? undefined : <ClaimLinks links={shape.links} />}
				/>
			)}

			{nothingFree && shape !== null ? (
				<p className="text-caption font-normal text-warning-fg">{t('preview.nextSample')}</p>
			) : null}

			{manyFree ? (
				<p className="text-caption font-normal text-text-muted">
					{t('preview.spacing', {
						count: preview.running.length,
						minutes: preview.spacingMinutes
					})}
				</p>
			) : null}

			<p className="text-caption font-normal text-text-muted">{t('preview.note')}</p>
		</section>
	);

	return (
		<ModulePage
			moduleId="game-alerts"
			icon={Gamepad2}
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
			aside={aside}
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
								toast.error(t('saveFailed'), { description: explain(error) });
							}
						);
					}}
					onResolveConflict={form.resolveConflict}
				/>
			}
		>
			<SettingsSection title={t('channel.title')} description={t('channel.description')}>
				<Field label={t('channel.label')} hint={t('channel.hint')}>
					<ChannelPicker
						channels={channels}
						kinds={GAME_ALERT_CHANNEL_KINDS}
						value={draft.channelId}
						onValueChange={(next) => {
							form.set('channelId', next);
						}}
					/>
				</Field>
			</SettingsSection>

			<SettingsSection title={t('stores.title')} description={t('stores.description')}>
				{GAME_STORES.map((store) => (
					<Switch
						key={store}
						checked={draft.stores.includes(store)}
						onCheckedChange={(next) => {
							form.set('stores', toggleStore(draft.stores, store, next));
						}}
						label={STORE_NAMES[store]}
						description={t(`stores.${store}`)}
					/>
				))}
			</SettingsSection>

			<SettingsSection title={t('mention.title')} description={t('mention.description')}>
				<Field label={t('mention.label')}>
					<RolePicker
						roles={roles}
						value={draft.pingRoleIds}
						max={GAME_ALERT_PING_ROLES_MAX}
						onValueChange={(next) => {
							form.set('pingRoleIds', next);
						}}
					/>
				</Field>

				<Switch
					checked={draft.pingEveryone}
					onCheckedChange={(next) => {
						form.set('pingEveryone', next);
					}}
					label={t('mention.everyone')}
					description={t('mention.everyoneHint')}
				/>
			</SettingsSection>

			<SettingsSection title={t('announcement.title')} description={t('announcement.description')}>
				<Switch
					checked={draft.showUpcoming}
					onCheckedChange={(next) => {
						form.set('showUpcoming', next);
					}}
					label={t('upcoming.label')}
					description={t('upcoming.hint')}
				/>
			</SettingsSection>
		</ModulePage>
	);
}
