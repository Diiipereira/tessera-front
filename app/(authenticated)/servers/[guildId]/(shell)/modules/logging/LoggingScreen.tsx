'use client';

import { ScrollText } from 'lucide-react';
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
			title="Logging"
			description="Write server events to a channel. Turn on only what you will actually read."
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
							toast.success('Logging saved');
						});
					}}
					onResolveConflict={form.resolveConflict}
				/>
			}
		>
			<SettingsSection
				title="Events"
				description={`${String(enabledCount)} of ${String(draft.events.length)} events are being written.`}
			>
				{missingChannel.length > 0 ? (
					<p className="rounded-md border border-warning bg-warning-subtle px-3 py-2 text-body-sm text-warning-fg">
						{missingChannel.length} {missingChannel.length === 1 ? 'event is' : 'events are'} on
						with no channel set &mdash; {missingChannel.length === 1 ? 'it' : 'they'} will not be
						written anywhere.
					</p>
				) : null}

				<div className="flex flex-col gap-6">
					{GROUPS.map((group) => {
						const events = draft.events.filter((event) => event.group === group);
						if (events.length === 0) return null;

						return (
							<div key={group} className="flex flex-col gap-2">
								<div className="flex items-center gap-3">
									<span className="font-mono text-overline text-text-muted uppercase">{group}</span>
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
														<p className="text-body">{event.name}</p>
														<p className="text-caption font-normal text-text-muted">
															{event.description}
														</p>
													</td>
													<td className="py-3 pr-4 align-top">
														<ChannelPicker
															channels={channels}
															value={event.channelId}
															onValueChange={(next) => {
																updateEvent(event.id, { channelId: next });
															}}
															placeholder="No channel…"
														/>
													</td>
													<td className="w-16 py-3 align-top">
														<Switch
															checked={event.enabled}
															aria-label={`Log ${event.name}`}
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

			<SettingsSection
				title="Ignore lists"
				description="Nothing from these is ever logged, whatever the events say."
			>
				<Field label="Ignored channels">
					<ChannelPicker
						channels={channels}
						value={draft.ignoredChannelIds[0] ?? null}
						onValueChange={(next) => {
							form.set('ignoredChannelIds', [next]);
						}}
						placeholder="Nothing ignored…"
					/>
				</Field>

				<Field label="Ignored roles">
					<RolePicker
						roles={roles}
						value={draft.ignoredRoleIds}
						onValueChange={(next) => {
							form.set('ignoredRoleIds', next);
						}}
						placeholder="Nobody ignored…"
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
					Set all to one channel
				</Button>
			}
		>
			<p className="mb-2 text-caption font-normal text-text-muted">
				Applies to every {group.toLowerCase()} event, on or off.
			</p>
			<ChannelPicker
				channels={channels}
				value={null}
				onValueChange={(next) => {
					onPick(next);
					setOpen(false);
				}}
				placeholder="Pick a channel…"
			/>
		</Popover>
	);
}
