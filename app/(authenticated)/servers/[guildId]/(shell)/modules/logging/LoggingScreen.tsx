'use client';

import { ScrollText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { ChannelPicker } from '@/components/discord/ChannelPicker';
import { RolePicker } from '@/components/discord/RolePicker';
import { ModulePage } from '@/components/modules/ModulePage';
import { SaveBar } from '@/components/modules/SaveBar';
import { SettingsSection } from '@/components/modules/SettingsSection';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Popover } from '@/components/ui/Popover';
import { Switch } from '@/components/ui/Switch';
import { useConfigDraft } from '@/lib/hooks/useConfigDraft';
import type { Channel, Role } from '@/lib/types/discord';
import type { LogEvent, LogGroup, LoggingConfig } from '@/lib/types/module-configs';

const GROUPS: LogGroup[] = ['Messages', 'Members', 'Moderation', 'Server', 'Voice'];

type LoggingScreenProps = {
	config: LoggingConfig;
	channels: Channel[];
	roles: Role[];
};

export function LoggingScreen({ config, channels, roles }: LoggingScreenProps) {
	const t = useTranslations('modules.logging');
	const form = useConfigDraft<LoggingConfig>(config);
	const draft = form.draft;

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

	const enabledCount = draft.events.filter((event) => event.enabled).length;
	const missingChannel = draft.events.filter((event) => event.enabled && event.channelId === null);

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
			<SettingsSection
				title={t('events.title')}
				description={t('events.description', {
					enabled: enabledCount,
					total: draft.events.length
				})}
			>
				{missingChannel.length > 0 ? (
					<p className="rounded-md border border-warning bg-warning-subtle px-3 py-2 text-body-sm text-warning-fg">
						{t('events.missing', { count: missingChannel.length })}
					</p>
				) : null}

				<div className="flex flex-col gap-6">
					{GROUPS.map((group) => {
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
														<p className="text-body">{t(`event.${event.id}.name`)}</p>
														<p className="text-caption font-normal text-text-muted">
															{t(`event.${event.id}.body`)}
														</p>
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
													<td className="w-16 py-3 align-top">
														<Switch
															checked={event.enabled}
															aria-label={t('events.log', {
																name: t(`event.${event.id}.name`)
															})}
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

			<SettingsSection title={t('ignore.title')} description={t('ignore.description')}>
				<Field label={t('ignore.channels')}>
					<ChannelPicker
						channels={channels}
						value={draft.ignoredChannelIds[0] ?? null}
						onValueChange={(next) => {
							form.set('ignoredChannelIds', [next]);
						}}
						placeholder={t('ignore.channelsPlaceholder')}
					/>
				</Field>

				<Field label={t('ignore.roles')}>
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
