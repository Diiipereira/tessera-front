'use client';

import { ScrollText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ChannelPicker } from '@/components/discord/ChannelPicker';
import { DiscordPreview } from '@/components/modules/DiscordPreview';
import { RolePicker } from '@/components/discord/RolePicker';
import { FieldHelp } from '@/components/modules/FieldHelp';
import { ModulePage } from '@/components/modules/ModulePage';
import { SaveBar } from '@/components/modules/SaveBar';
import { SettingsSection } from '@/components/modules/SettingsSection';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Badge } from '@/components/ui/Badge';
import { Popover } from '@/components/ui/Popover';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { useConfigDraft, type SaveOutcome } from '@/lib/hooks/useConfigDraft';
import { useApiFailure, useThrownFailure } from '@/lib/hooks/useApiFailure';
import { loadRoutes, saveRoutes, sendLogTest } from '@/lib/logging-client';
import { MODULE_HELP } from '@/lib/module-help';
import { useRelativeTime } from '@/lib/hooks/useRelativeTime';
import { patchModule } from '@/lib/module-client';
import {
	groupsInOrder,
	missingChannel,
	toLoggingConfig,
	toLoggingPatch,
	toRoutePayload
} from '@/lib/modules/logging';
import {
	previewVariables,
	toMessageDraft,
	type LoggingPreviewDto
} from '@/lib/modules/log-preview';
import type { Channel, Role } from '@/lib/types/discord';
import { TemplateDialog } from './TemplateDialog';
import type { LogEvent, LogGroup, LoggingConfig } from '@/lib/types/module-configs';

type Naming = ReturnType<typeof useTranslations<'modules.logging'>>;

const eventNamer =
	(t: Naming) =>
	(id: string): string =>
		t.has(`event.${id}.name`) ? t(`event.${id}.name`) : id;

type LoggingScreenProps = {
	guildId: string;
	config: LoggingConfig;
	version: number;
	channels: Channel[];
	roles: Role[];
	preview: LoggingPreviewDto | null;
	now: string;
	botName: string;
	botAvatarUrl: string | null;
};

export function LoggingScreen({
	guildId,
	config,
	version,
	channels,
	roles,
	preview,
	now,
	botName,
	botAvatarUrl
}: LoggingScreenProps) {
	const t = useTranslations('modules.logging');
	const name = eventNamer(t);
	const explain = useThrownFailure();
	const versionRef = useRef(version);

	const save = useCallback(
		async (next: LoggingConfig): Promise<SaveOutcome<LoggingConfig>> => {
			const patched = await patchModule(guildId, 'logging', {
				version: versionRef.current,
				enabled: next.enabled,
				config: toLoggingPatch(next)
			});

			if (patched.status === 'error') return patched;

			versionRef.current = patched.state.version;

			if (patched.status === 'conflict') {
				const stored = await loadRoutes(guildId);

				if (stored.status === 'error') return stored;

				return {
					status: 'conflict',
					current: toLoggingConfig(patched.state, stored.events)
				};
			}

			const written = await saveRoutes(guildId, toRoutePayload(next.events));

			if (written.status === 'error') return written;

			return { status: 'saved', saved: toLoggingConfig(patched.state, written.events) };
		},
		[guildId]
	);

	const form = useConfigDraft<LoggingConfig>(config, { save });
	const draft = form.draft;
	const groups = groupsInOrder(draft.events);

	function updateEvent(id: string, patch: Partial<LogEvent>) {
		form.set(
			'events',
			draft.events.map((event) => (event.id === id ? { ...event, ...patch } : event))
		);
	}

	function setGroupChannel(group: LogGroup, channelId: string) {
		form.set(
			'events',
			draft.events.map((event) => (event.group === group ? { ...event, channelId } : event))
		);
	}

	const [editing, setEditing] = useState<LogEvent | null>(null);
	const enabledCount = draft.events.filter((event) => event.enabled).length;
	const missing = missingChannel(draft.events);

	return (
		<ModulePage
			moduleId="logging"
			icon={ScrollText}
			title={t('title')}
			description={t('description')}
			enabled={draft.enabled}
			onEnabledChange={(next) => {
				form.set('enabled', next);
			}}
			aside={
				preview === null ? undefined : (
					<LogPreview
						guildId={guildId}
						events={draft.events}
						preview={preview}
						now={now}
						dirty={form.dirty}
						botName={botName}
						botAvatarUrl={botAvatarUrl}
					/>
				)
			}
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
			<SettingsSection
				title={t('events.title')}
				description={t('events.description', {
					enabled: enabledCount,
					total: draft.events.length
				})}
				action={<FieldHelp {...MODULE_HELP.loggingEvents} />}
			>
				{missing.length > 0 ? (
					<p className="rounded-md border border-warning bg-warning-subtle px-3 py-2 text-body-sm text-warning-fg">
						{t('events.missing', {
							count: missing.length,
							names: missing.map((event) => name(event.id)).join(', ')
						})}
					</p>
				) : null}

				<div className="flex flex-col gap-6">
					{groups.map((group) => {
						const events = draft.events.filter((event) => event.group === group);
						if (events.length === 0) return null;

						return (
							<div key={group} className="flex flex-col gap-2">
								<div className="flex items-center gap-3">
									<span className="font-mono text-overline text-text-muted uppercase">
										{t(`groups.${group}`)}
									</span>
									<div className="h-px flex-1 bg-border" />
									<GroupChannelButton
										group={group}
										channels={channels}
										onPick={(channelId) => {
											setGroupChannel(group, channelId);
										}}
									/>
								</div>

								<div className="overflow-x-auto">
									<table className="w-full min-w-140 border-collapse">
										<tbody>
											{events.map((event) => (
												<tr key={event.id} className="border-b border-border last:border-0">
													<td className="w-2/5 py-3 pr-4 align-top">
														<p className="text-body">{name(event.id)}</p>
														{t.has(`event.${event.id}.body`) ? (
															<p className="text-caption font-normal text-text-muted">
																{t(`event.${event.id}.body`)}
															</p>
														) : null}
													</td>
													<td className="py-3 pr-4 align-top">
														<ChannelPicker
															channels={channels}
															value={event.channelId}
															onValueChange={(next) => {
																updateEvent(event.id, { channelId: next });
															}}
															placeholder={t('events.noChannel')}
														/>
													</td>
													<td className="py-3 pr-4 align-top">
														<Button
															variant="ghost"
															size="sm"
															onClick={() => {
																setEditing(event);
															}}
														>
															{event.template === null ? (
																t('template.edit')
															) : (
																<Badge variant="info">{t('template.custom')}</Badge>
															)}
														</Button>
													</td>
													<td className="w-16 py-3 align-top">
														<Switch
															checked={event.enabled}
															aria-label={t('events.log', { name: name(event.id) })}
															onCheckedChange={(next) => {
																updateEvent(event.id, { enabled: next });
															}}
														/>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						);
					})}
				</div>
			</SettingsSection>

			{editing === null || preview === null ? null : (
				<TemplateDialog
					guildId={guildId}
					eventType={editing.id}
					eventName={name(editing.id)}
					template={editing.template}
					names={preview.names}
					offered={preview.previews.find((one) => one.eventType === editing.id)?.variables ?? {}}
					now={now}
					onCancel={() => {
						setEditing(null);
					}}
					onSave={(template) => {
						updateEvent(editing.id, { template });
						setEditing(null);
					}}
				/>
			)}

			<SettingsSection title={t('ignore.title')} description={t('ignore.description')}>
				<Field
					label={t('ignore.channels')}
					action={<FieldHelp {...MODULE_HELP.loggingIgnoredChannels} />}
				>
					<ChannelPicker
						channels={channels}
						value={draft.ignoredChannelIds[0] ?? null}
						onValueChange={(next) => {
							form.set('ignoredChannelIds', [next]);
						}}
						placeholder={t('ignore.channelsPlaceholder')}
					/>
				</Field>

				<Field
					label={t('ignore.roles')}
					action={<FieldHelp {...MODULE_HELP.loggingIgnoredRoles} />}
				>
					<RolePicker
						roles={roles}
						value={draft.ignoredRoleIds}
						onValueChange={(next) => {
							form.set('ignoredRoleIds', next);
						}}
						placeholder={t('ignore.rolesPlaceholder')}
					/>
				</Field>
			</SettingsSection>
		</ModulePage>
	);
}

type LogPreviewProps = {
	guildId: string;
	events: LogEvent[];
	preview: LoggingPreviewDto;
	now: string;
	dirty: boolean;
	botName: string;
	botAvatarUrl: string | null;
};

function LogPreview({
	guildId,
	events,
	preview,
	now,
	dirty,
	botName,
	botAvatarUrl
}: LogPreviewProps) {
	const t = useTranslations('modules.logging');
	const name = eventNamer(t);
	const relative = useRelativeTime();
	const describe = useApiFailure();
	const firstOn = events.find((event) => event.enabled)?.id;
	const [chosen, setChosen] = useState(firstOn ?? preview.previews[0]?.eventType ?? '');
	const [testing, setTesting] = useState(false);

	const shown = preview.previews.find((one) => one.eventType === chosen) ?? preview.previews[0];

	if (shown === undefined) return null;

	const at = new Date(now);
	const eventType = shown.eventType;

	async function runTest(): Promise<void> {
		setTesting(true);

		const result = await sendLogTest(guildId, eventType);

		setTesting(false);

		if (result.status === 'error') {
			toast.error(t('test.failed'), { description: describe(result.failure) });
			return;
		}

		if (result.outcome === 'sent') {
			toast.success(t('test.sent'));
			return;
		}

		toast.warning(t(result.outcome === 'not-ready' ? 'test.notReady' : 'test.channelRefused'));
	}

	const variables = previewVariables(shown.embed, preview.names, t('preview.unknown'), (moment) =>
		relative(moment.toISOString(), at)
	);

	return (
		<section
			aria-label={t('preview.title')}
			className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-1"
		>
			<div className="flex items-start gap-3">
				<h2 className="min-w-0 flex-1 text-h4">{t('preview.title')}</h2>
				<div className="flex shrink-0 items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						loading={testing}
						disabled={dirty}
						title={dirty ? t('test.dirty') : undefined}
						onClick={() => {
							void runTest();
						}}
					>
						{t('test.action')}
					</Button>
					<FieldHelp {...MODULE_HELP.loggingPreview} />
				</div>
			</div>

			<Field label={t('preview.event')}>
				<Select
					value={shown.eventType}
					onValueChange={setChosen}
					options={preview.previews.map((one) => ({
						value: one.eventType,
						label: name(one.eventType)
					}))}
				/>
			</Field>

			<DiscordPreview
				message={toMessageDraft(shown.embed)}
				variables={variables}
				timestampLabel={relative(shown.embed.timestamp ?? null, at)}
				botName={botName}
				botAvatarUrl={botAvatarUrl}
			/>

			<p className="text-caption font-normal text-text-muted">{t('preview.description')}</p>
		</section>
	);
}

type GroupChannelButtonProps = {
	group: LogGroup;
	channels: Channel[];
	onPick: (channelId: string) => void;
};

function GroupChannelButton({ group, channels, onPick }: GroupChannelButtonProps) {
	const t = useTranslations('modules.logging');
	const [open, setOpen] = useState(false);

	return (
		<Popover
			open={open}
			onOpenChange={setOpen}
			align="end"
			className="w-72 max-w-none p-2"
			triggerAsChild
			trigger={
				<Button variant="ghost" size="sm">
					{t('events.setAll')}
				</Button>
			}
		>
			<p className="mb-2 text-caption font-normal text-text-muted">
				{t('events.setAllHint', { group: t(`groups.${group}`).toLowerCase() })}
			</p>
			<ChannelPicker
				channels={channels}
				value={null}
				onValueChange={(next) => {
					onPick(next);
					setOpen(false);
				}}
			/>
		</Popover>
	);
}
