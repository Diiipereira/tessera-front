'use client';

import { CalendarClock, Pencil, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
import { nextRuns, readSchedule, toCron, WEEKDAYS, type Run } from '@/lib/schedule';
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
	const t = useTranslations('modules.scheduled');
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

	function toggleDay(message: ScheduledMessage, day: (typeof WEEKDAYS)[number]) {
		update(message.id, {
			days: message.days.includes(day)
				? message.days.filter((entry) => entry !== day)
				: [...message.days, day]
		});
	}

	function whenLabel(message: ScheduledMessage): string {
		const schedule = readSchedule(message);

		if (schedule.kind === 'once') return t('when.once', { at: schedule.at.replace('T', ' ') });
		if (schedule.kind === 'daily') return t('when.daily', { time: schedule.time });
		if (schedule.kind === 'days') {
			const names = schedule.days.map((day) => t(`weekday.${day}`)).join(', ');
			return t('when.days', { days: names, time: schedule.time });
		}

		return t(`when.${schedule.kind}`);
	}

	function runLabel(run: Run): string {
		if ('at' in run) return run.at.replace('T', ' ');

		const day = t(`weekday.${run.day}`);
		if (run.week === 0) return t('run.this', { day, time: run.time });
		if (run.week === 1) return t('run.next', { day, time: run.time });

		return t('run.later', { weeks: run.week, day, time: run.time });
	}

	const runs = selected ? nextRuns(selected) : [];

	return (
		<ModulePage
			moduleId="scheduled"
			icon={CalendarClock}
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
				title={t('list.title')}
				description={t('list.description')}
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
						{t('new')}
					</Button>
				}
			>
				<Field label={t('list.timezone')} className="max-w-80">
					<Select
						options={TIMEZONES}
						value={draft.timezone}
						onValueChange={(next) => {
							form.set('timezone', next);
						}}
					/>
				</Field>

				{draft.messages.length === 0 ? (
					<p className="text-body-sm text-text-muted">{t('list.empty')}</p>
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
										{message.name === '' ? t('untitled') : message.name}
									</span>
									<span className="block truncate text-caption font-normal text-text-muted">
										{whenLabel(message)}
									</span>
								</button>

								<Switch
									checked={message.enabled}
									aria-label={t('list.enable', {
										name: message.name === '' ? t('untitled') : message.name
									})}
									onCheckedChange={(next) => {
										update(message.id, { enabled: next });
									}}
								/>

								<Button
									variant="ghost"
									size="sm"
									iconOnly
									aria-label={t('list.edit', {
										name: message.name === '' ? t('untitled') : message.name
									})}
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
									aria-label={t('list.delete', {
										name: message.name === '' ? t('untitled') : message.name
									})}
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
					<SettingsSection title={t('form.title')}>
						<Field label={t('form.name')} hint={t('form.nameHint')}>
							<Input
								value={selected.name}
								onChange={(event) => {
									update(selected.id, { name: event.target.value });
								}}
								placeholder={t('form.namePlaceholder')}
							/>
						</Field>

						<Field label={t('form.channel')}>
							<ChannelPicker
								channels={channels}
								value={selected.channelId}
								onValueChange={(next) => {
									update(selected.id, { channelId: next });
								}}
							/>
						</Field>

						<div className="flex flex-col gap-2">
							<span className="text-body-sm font-medium">{t('form.repeats')}</span>
							<SegmentedControl
								options={[
									{ value: 'once', label: t('form.once') },
									{ value: 'recurring', label: t('form.recurring') }
								]}
								value={selected.kind}
								onValueChange={(next) => {
									update(selected.id, { kind: next });
								}}
								label={t('form.kind')}
								className="w-fit"
							/>
						</div>

						{selected.kind === 'once' ? (
							<Field label={t('form.when')}>
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
									<span className="text-body-sm font-medium">{t('form.days')}</span>
									<div className="flex flex-wrap gap-1.5">
										{WEEKDAYS.map((day) => {
											const active = selected.days.includes(day);
											return (
												<button
													key={day}
													type="button"
													aria-pressed={active}
													aria-label={t(`weekday.${day}`)}
													onClick={() => {
														toggleDay(selected, day);
													}}
													className={cn(
														'grid size-9 place-items-center rounded-md border text-body-sm font-medium transition-colors duration-120 ease-out',
														active
															? 'border-primary bg-primary-subtle text-primary'
															: 'border-border bg-surface text-text-muted hover:border-border-strong hover:text-text'
													)}
												>
													{t(`weekdayShort.${day}`)}
												</button>
											);
										})}
									</div>
								</div>

								<Field label={t('form.time')} className="max-w-40">
									<DateTimeInput
										type="time"
										value={selected.timeOfDay}
										onValueChange={(next) => {
											update(selected.id, { timeOfDay: next });
										}}
									/>
								</Field>

								<div className="rounded-md border border-border bg-surface-sunken p-3">
									<p className="mb-1 font-mono text-overline text-text-muted uppercase">
										{t('form.cron')}
									</p>
									<code className="font-mono text-body-sm text-text">
										{toCron(selected.days, selected.timeOfDay)}
									</code>
								</div>
							</>
						)}

						{runs.length > 0 ? (
							<div>
								<p className="mb-1.5 font-mono text-overline text-text-muted uppercase">
									{t('form.next', { count: runs.length })}
								</p>
								<ul className="flex flex-col gap-1">
									{runs.map((run) => (
										<li key={runLabel(run)} className="text-body-sm text-text-muted">
											{runLabel(run)}
										</li>
									))}
								</ul>
							</div>
						) : (
							<p className="text-caption font-normal text-warning-fg">{t('form.nothing')}</p>
						)}
					</SettingsSection>

					<SettingsSection title={t('message.title')}>
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
