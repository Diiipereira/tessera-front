'use client';

import { CalendarClock, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ChannelPicker } from '@/components/discord/ChannelPicker';
import { MessageComposer } from '@/components/modules/MessageComposer';
import { ModulePage } from '@/components/modules/ModulePage';
import { SaveBar } from '@/components/modules/SaveBar';
import { SettingsSection } from '@/components/modules/SettingsSection';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { DateTimeInput } from '@/components/ui/DateTimeInput';
import { Input } from '@/components/ui/Input';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { useConfigDraft } from '@/lib/hooks/useConfigDraft';
import { describeSchedule, nextRuns, toCron, WEEKDAYS } from '@/lib/schedule';
import type { Channel } from '@/lib/types/discord';
import type { ScheduledConfig, ScheduledMessage } from '@/lib/types/module-configs';
import type { MessageVariable } from '@/lib/types/modules';
import { EMBED_SWATCHES } from '@/lib/discord-colors';
import { cn } from '@/lib/utils/cn';
import { newId } from '@/lib/utils/id';

const TIMEZONES = [
	{ value: 'America/Sao_Paulo', label: 'America/São Paulo (GMT-3)' },
	{ value: 'UTC', label: 'UTC' },
	{ value: 'Europe/Lisbon', label: 'Europe/Lisbon (GMT+0)' },
	{ value: 'America/New_York', label: 'America/New York (GMT-5)' }
];

function blankMessage(): ScheduledMessage {
	return {
		id: newId('sm'),
		name: '',
		channelId: null,
		kind: 'recurring',
		runAt: '',
		days: ['mon'],
		timeOfDay: '09:00',
		enabled: true,
		message: {
			mode: 'text',
			text: '',
			embed: {
				authorName: '',
				title: '',
				description: '',
				color: EMBED_SWATCHES[0],
				fields: [],
				imageUrl: '',
				thumbnailUrl: '',
				footerText: '',
				timestamp: false
			}
		}
	};
}

type ScheduledScreenProps = {
	config: ScheduledConfig;
	channels: Channel[];
	variables: MessageVariable[];
};

export function ScheduledScreen({ config, channels, variables }: ScheduledScreenProps) {
	const form = useConfigDraft<ScheduledConfig>(config);
	const draft = form.draft;

	const [selectedId, setSelectedId] = useState(draft.messages[0]?.id ?? null);
	const selected = draft.messages.find((message) => message.id === selectedId) ?? null;

	function update(id: string, patch: Partial<ScheduledMessage>) {
		form.set(
			'messages',
			draft.messages.map((message) => (message.id === id ? { ...message, ...patch } : message))
		);
	}

	function toggleDay(message: ScheduledMessage, day: (typeof WEEKDAYS)[number]['id']) {
		update(message.id, {
			days: message.days.includes(day)
				? message.days.filter((entry) => entry !== day)
				: [...message.days, day]
		});
	}

	const runs = selected ? nextRuns(selected) : [];

	return (
		<ModulePage
			moduleId="scheduled"
			icon={CalendarClock}
			title="Scheduled messages"
			description="Post on a timer, without anyone having to remember."
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
							toast.success('Schedules saved');
						});
					}}
					onResolveConflict={form.resolveConflict}
				/>
			}
		>
			<SettingsSection
				title="Messages"
				description="Every schedule runs in the server timezone."
				action={
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							const message = blankMessage();
							form.set('messages', [...draft.messages, message]);
							setSelectedId(message.id);
						}}
					>
						<Plus aria-hidden="true" />
						New message
					</Button>
				}
			>
				<Field label="Server timezone" className="max-w-80">
					<Select
						options={TIMEZONES}
						value={draft.timezone}
						onValueChange={(next) => {
							form.set('timezone', next);
						}}
					/>
				</Field>

				{draft.messages.length === 0 ? (
					<p className="text-body-sm text-text-muted">Nothing scheduled.</p>
				) : (
					<ul className="flex flex-col">
						{draft.messages.map((message) => (
							<li
								key={message.id}
								className="flex items-center gap-3 border-b border-border py-3 last:border-0"
							>
								<button
									type="button"
									onClick={() => {
										setSelectedId(message.id);
									}}
									className="min-w-0 flex-1 text-left"
								>
									<span
										className={cn(
											'block truncate text-body font-medium',
											message.id === selectedId ? 'text-primary' : 'text-text'
										)}
									>
										{message.name === '' ? 'Untitled message' : message.name}
									</span>
									<span className="block truncate text-caption font-normal text-text-muted">
										{describeSchedule(message)}
									</span>
								</button>

								<Switch
									checked={message.enabled}
									aria-label={`Enable ${message.name === '' ? 'untitled message' : message.name}`}
									onCheckedChange={(next) => {
										update(message.id, { enabled: next });
									}}
								/>

								<Button
									variant="ghost"
									size="sm"
									iconOnly
									aria-label={`Edit ${message.name === '' ? 'untitled message' : message.name}`}
									onClick={() => {
										setSelectedId(message.id);
									}}
								>
									<Pencil aria-hidden="true" />
								</Button>

								<Button
									variant="ghost-danger"
									size="sm"
									iconOnly
									aria-label={`Delete ${message.name === '' ? 'untitled message' : message.name}`}
									onClick={() => {
										const rest = draft.messages.filter((entry) => entry.id !== message.id);
										form.set('messages', rest);
										if (selectedId === message.id) setSelectedId(rest[0]?.id ?? null);
									}}
								>
									<Trash2 aria-hidden="true" />
								</Button>
							</li>
						))}
					</ul>
				)}
			</SettingsSection>

			{selected ? (
				<>
					<SettingsSection title="Schedule">
						<Field label="Name" hint="Internal only.">
							<Input
								value={selected.name}
								onChange={(event) => {
									update(selected.id, { name: event.target.value });
								}}
								placeholder="Weekly event reminder"
							/>
						</Field>

						<Field label="Channel">
							<ChannelPicker
								channels={channels}
								value={selected.channelId}
								onValueChange={(next) => {
									update(selected.id, { channelId: next });
								}}
							/>
						</Field>

						<div className="flex flex-col gap-2">
							<span className="text-body-sm font-medium">Repeats</span>
							<SegmentedControl
								options={[
									{ value: 'once', label: 'Once' },
									{ value: 'recurring', label: 'Recurring' }
								]}
								value={selected.kind}
								onValueChange={(next) => {
									update(selected.id, { kind: next });
								}}
								label="Schedule kind"
								className="w-fit"
							/>
						</div>

						{selected.kind === 'once' ? (
							<Field label="When">
								<DateTimeInput
									type="datetime-local"
									value={selected.runAt}
									onValueChange={(next) => {
										update(selected.id, { runAt: next });
									}}
									className="max-w-60"
								/>
							</Field>
						) : (
							<>
								<div className="flex flex-col gap-2">
									<span className="text-body-sm font-medium">Days</span>
									<div className="flex flex-wrap gap-1.5">
										{WEEKDAYS.map((day) => {
											const active = selected.days.includes(day.id);
											return (
												<button
													key={day.id}
													type="button"
													aria-pressed={active}
													aria-label={day.label}
													onClick={() => {
														toggleDay(selected, day.id);
													}}
													className={cn(
														'grid size-9 place-items-center rounded-md border text-body-sm font-medium transition-colors duration-120 ease-out',
														active
															? 'border-primary bg-primary-subtle text-primary'
															: 'border-border bg-surface text-text-muted hover:border-border-strong hover:text-text'
													)}
												>
													{day.short}
												</button>
											);
										})}
									</div>
								</div>

								<Field label="Time" className="max-w-40">
									<DateTimeInput
										type="time"
										value={selected.timeOfDay}
										onValueChange={(next) => {
											update(selected.id, { timeOfDay: next });
										}}
									/>
								</Field>

								<div className="rounded-md border border-border bg-surface-sunken p-3">
									<p className="mb-1 font-mono text-overline text-text-muted uppercase">Cron</p>
									<code className="font-mono text-body-sm text-text">
										{toCron(selected.days, selected.timeOfDay)}
									</code>
								</div>
							</>
						)}

						{runs.length > 0 ? (
							<div>
								<p className="mb-1.5 font-mono text-overline text-text-muted uppercase">
									Next {runs.length}
								</p>
								<ul className="flex flex-col gap-1">
									{runs.map((run) => (
										<li key={run} className="text-body-sm text-text-muted">
											{run}
										</li>
									))}
								</ul>
							</div>
						) : (
							<p className="text-caption font-normal text-warning-fg">
								Nothing is scheduled — pick at least one day, or a date.
							</p>
						)}
					</SettingsSection>

					<SettingsSection title="Message">
						<MessageComposer
							value={selected.message}
							onChange={(next) => {
								update(selected.id, { message: next });
							}}
							variables={variables}
						/>
					</SettingsSection>
				</>
			) : null}
		</ModulePage>
	);
}
