'use client';

import {
	AtSign,
	CaseUpper,
	Link2,
	MessageSquareWarning,
	Paperclip,
	Pencil,
	Plus,
	ShieldAlert,
	Ticket,
	Trash2,
	TriangleAlert,
	Type,
	type LucideIcon
} from 'lucide-react';
import { useId, useState } from 'react';
import { toast } from 'sonner';
import { ChannelPicker } from '@/components/discord/ChannelPicker';
import { RolePicker } from '@/components/discord/RolePicker';
import { ModulePage } from '@/components/modules/ModulePage';
import { SaveBar } from '@/components/modules/SaveBar';
import { SettingsSection } from '@/components/modules/SettingsSection';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { NumberInput } from '@/components/ui/NumberInput';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { describeTrigger, evaluateMessage, untestableTriggers } from '@/lib/automod';
import type {
	AutoModAction,
	AutoModConfig,
	AutoModRule,
	AutoModTrigger
} from '@/lib/types/module-configs';
import type { Channel, Role } from '@/lib/types/discord';
import { useConfigDraft } from '@/lib/hooks/useConfigDraft';
import { cn } from '@/lib/utils/cn';
import { newId } from '@/lib/utils/id';

const TRIGGERS: { id: AutoModTrigger; label: string; blurb: string; icon: LucideIcon }[] = [
	{ id: 'spam', label: 'Spam', blurb: 'Too many messages too fast', icon: MessageSquareWarning },
	{ id: 'invites', label: 'Invites', blurb: 'Links to other servers', icon: Ticket },
	{ id: 'links', label: 'Links', blurb: 'Any URL at all', icon: Link2 },
	{ id: 'caps', label: 'Capitals', blurb: 'SHOUTING', icon: CaseUpper },
	{ id: 'mentions', label: 'Mentions', blurb: 'Mass pings', icon: AtSign },
	{ id: 'words', label: 'Words', blurb: 'Your own blocklist', icon: Type },
	{ id: 'attachments', label: 'Attachments', blurb: 'Too many files', icon: Paperclip }
];

const ACTIONS: { id: AutoModAction; label: string }[] = [
	{ id: 'delete', label: 'Delete' },
	{ id: 'warn', label: 'Warn' },
	{ id: 'timeout', label: 'Timeout' },
	{ id: 'kick', label: 'Kick' },
	{ id: 'ban', label: 'Ban' },
	{ id: 'log', label: 'Log only' }
];

const ACTION_VARIANTS: Record<AutoModAction, BadgeVariant> = {
	delete: 'neutral',
	warn: 'warning',
	timeout: 'warning',
	kick: 'danger',
	ban: 'danger',
	log: 'info'
};

const TRIGGER_LABEL: Record<AutoModTrigger, string> = Object.fromEntries(
	TRIGGERS.map((entry) => [entry.id, entry.label])
) as Record<AutoModTrigger, string>;

function newRule(): AutoModRule {
	return {
		id: newId('rule'),
		name: '',
		trigger: 'spam',
		threshold: 5,
		windowSeconds: 5,
		actions: ['delete'],
		exemptRoleIds: [],
		exemptChannelIds: [],
		words: [],
		enabled: true
	};
}

type AutoModScreenProps = {
	config: AutoModConfig;
	channels: Channel[];
	roles: Role[];
};

export function AutoModScreen({ config, channels, roles }: AutoModScreenProps) {
	const form = useConfigDraft<AutoModConfig>(config);
	const draft = form.draft;

	const [editing, setEditing] = useState<AutoModRule | null>(null);
	const [isNew, setIsNew] = useState(false);
	const [sample, setSample] = useState('CHECK THIS OUT discord.gg/freestuff @everyone');

	const hits = evaluateMessage(sample, draft.rules);
	const untestable = untestableTriggers(draft.rules);

	function commitRule(rule: AutoModRule) {
		const exists = draft.rules.some((entry) => entry.id === rule.id);
		form.set(
			'rules',
			exists
				? draft.rules.map((entry) => (entry.id === rule.id ? rule : entry))
				: [...draft.rules, rule]
		);
		setEditing(null);
	}

	return (
		<ModulePage
			moduleId="automod"
			icon={ShieldAlert}
			title="AutoMod"
			description="Rules that act before a human has to. Every hit is written to the case log."
			enabled={draft.enabled}
			onEnabledChange={(next) => {
				form.set('enabled', next);
			}}
			headerAction={
				<Button
					variant="outline"
					size="sm"
					onClick={() => {
						setEditing(newRule());
						setIsNew(true);
					}}
				>
					<Plus aria-hidden="true" />
					New rule
				</Button>
			}
			saveBar={
				<SaveBar
					dirty={form.dirty}
					changedCount={form.changedCount}
					state={form.state}
					onDiscard={form.discard}
					onSave={() => {
						void form.save().then(() => {
							toast.success('AutoMod rules saved');
						});
					}}
					onResolveConflict={form.resolveConflict}
				/>
			}
		>
			<SettingsSection
				title="Rules"
				description="Checked top to bottom. The first rule that fires wins."
			>
				{draft.rules.length === 0 ? (
					<p className="text-body-sm text-text-muted">No rules yet. Nothing is being filtered.</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full min-w-160 border-collapse">
							<thead>
								<tr className="border-b border-border text-left">
									{RULE_COLUMNS.map((column) => (
										<th
											key={column.label}
											className="pb-2 font-mono text-overline font-semibold text-text-muted uppercase"
										>
											{column.hidden ? (
												<span className="sr-only">{column.label}</span>
											) : (
												column.label
											)}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{draft.rules.map((rule) => {
									const label = rule.name === '' ? 'Untitled rule' : rule.name;
									return (
										<tr key={rule.id} className="border-b border-border last:border-0">
											<td className="py-3 pr-3">
												<button
													type="button"
													className="text-left text-body font-medium text-link hover:underline"
													onClick={() => {
														setEditing(rule);
														setIsNew(false);
													}}
												>
													{label}
												</button>
												<p className="text-caption font-normal text-text-muted">
													{TRIGGER_LABEL[rule.trigger]}
												</p>
											</td>
											<td className="py-3 pr-3 text-body-sm text-text-muted">
												{describeTrigger(rule.trigger, rule)}
											</td>
											<td className="py-3 pr-3">
												<div className="flex flex-wrap gap-1">
													{rule.actions.map((action) => (
														<Badge key={action} variant={ACTION_VARIANTS[action]}>
															{ACTIONS.find((entry) => entry.id === action)?.label ?? action}
														</Badge>
													))}
												</div>
											</td>
											<td className="py-3 pr-3">
												<Switch
													checked={rule.enabled}
													aria-label={`Enable ${label}`}
													onCheckedChange={(next) => {
														form.set(
															'rules',
															draft.rules.map((entry) =>
																entry.id === rule.id ? { ...entry, enabled: next } : entry
															)
														);
													}}
												/>
											</td>
											<td className="py-3">
												<div className="flex items-center justify-end gap-1">
													<Button
														variant="ghost"
														size="sm"
														iconOnly
														aria-label={`Edit ${label}`}
														onClick={() => {
															setEditing(rule);
															setIsNew(false);
														}}
													>
														<Pencil aria-hidden="true" />
													</Button>
													<Button
														variant="ghost-danger"
														size="sm"
														iconOnly
														aria-label={`Delete ${label}`}
														onClick={() => {
															form.set(
																'rules',
																draft.rules.filter((entry) => entry.id !== rule.id)
															);
														}}
													>
														<Trash2 aria-hidden="true" />
													</Button>
												</div>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
			</SettingsSection>

			<SettingsSection
				title="Test playground"
				description="Paste something a member might send and see which rules would catch it."
			>
				<Field label="Sample message">
					<Textarea
						value={sample}
						onChange={(event) => {
							setSample(event.target.value);
						}}
						className="min-h-20 font-mono"
					/>
				</Field>

				<div
					aria-live="polite"
					className={cn(
						'rounded-lg border p-4',
						hits.length > 0 ? 'border-warning bg-warning-subtle' : 'border-border bg-surface-sunken'
					)}
				>
					{hits.length === 0 ? (
						<p className="text-body-sm text-text-muted">
							Nothing fires. This message would go through.
						</p>
					) : (
						<ul className="flex flex-col gap-2">
							{hits.map((hit) => (
								<li key={hit.rule.id} className="flex items-start gap-2">
									<TriangleAlert
										className="mt-0.5 size-3.5 shrink-0 text-warning"
										aria-hidden="true"
									/>
									<span className="text-body-sm text-warning-fg">
										<span className="font-medium">{hit.rule.name}</span> would fire &mdash;{' '}
										{hit.reason}
									</span>
								</li>
							))}
						</ul>
					)}
				</div>

				{untestable.length > 0 ? (
					<p className="text-caption font-normal text-text-muted">
						{untestable.map((rule) => rule.name).join(', ')} cannot be tested here &mdash;{' '}
						{untestable.length === 1 ? 'it needs' : 'they need'} message history or attachments.
					</p>
				) : null}
			</SettingsSection>

			{editing ? (
				<RuleDialog
					rule={editing}
					isNew={isNew}
					channels={channels}
					roles={roles}
					onCancel={() => {
						setEditing(null);
					}}
					onSave={commitRule}
				/>
			) : null}
		</ModulePage>
	);
}

const RULE_COLUMNS: { label: string; hidden?: boolean }[] = [
	{ label: 'Rule' },
	{ label: 'Fires on' },
	{ label: 'Then' },
	{ label: 'Enabled', hidden: true },
	{ label: 'Actions', hidden: true }
];

type RuleDialogProps = {
	rule: AutoModRule;
	isNew: boolean;
	channels: Channel[];
	roles: Role[];
	onCancel: () => void;
	onSave: (rule: AutoModRule) => void;
};

function RuleDialog({ rule, isNew, channels, roles, onCancel, onSave }: RuleDialogProps) {
	const [work, setWork] = useState(rule);
	const triggerLabelId = useId();
	const actionsLabelId = useId();

	function patch(values: Partial<AutoModRule>) {
		setWork((current) => ({ ...current, ...values }));
	}

	function toggleAction(action: AutoModAction) {
		patch({
			actions: work.actions.includes(action)
				? work.actions.filter((entry) => entry !== action)
				: [...work.actions, action]
		});
	}

	const needsThreshold = work.trigger !== 'invites' && work.trigger !== 'links';
	const needsWindow = work.trigger === 'spam';
	const needsWords = work.trigger === 'words';

	return (
		<Dialog
			open
			onOpenChange={(next) => {
				if (!next) onCancel();
			}}
			title={isNew ? 'New rule' : 'Edit rule'}
			description="Pick what it watches for, then what happens when it fires."
			size="lg"
			footer={
				<>
					<Button variant="ghost" onClick={onCancel}>
						Cancel
					</Button>
					<Button
						disabled={work.actions.length === 0}
						onClick={() => {
							onSave(work);
						}}
					>
						{isNew ? 'Create rule' : 'Save rule'}
					</Button>
				</>
			}
		>
			<div className="flex flex-col gap-5">
				<Field label="Name">
					<Input
						value={work.name}
						onChange={(event) => {
							patch({ name: event.target.value });
						}}
						placeholder="Mass mentions"
					/>
				</Field>

				<div className="flex flex-col gap-2" role="group" aria-labelledby={triggerLabelId}>
					<span id={triggerLabelId} className="text-body-sm font-medium">
						Fires on
					</span>
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
						{TRIGGERS.map((trigger) => {
							const Icon = trigger.icon;
							const active = work.trigger === trigger.id;
							return (
								<button
									key={trigger.id}
									type="button"
									aria-pressed={active}
									onClick={() => {
										patch({ trigger: trigger.id });
									}}
									className={cn(
										'flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors duration-120 ease-out',
										active
											? 'border-primary bg-primary-subtle'
											: 'border-border bg-surface hover:border-border-strong'
									)}
								>
									<span className="flex min-w-0 items-center gap-2">
										<Icon
											className={cn(
												'size-4 shrink-0',
												active ? 'text-primary' : 'text-text-subtle'
											)}
											aria-hidden="true"
										/>
										<span className="min-w-0 truncate text-body-sm font-medium">
											{trigger.label}
										</span>
									</span>
									<span className="text-caption font-normal text-pretty text-text-muted">
										{trigger.blurb}
									</span>
								</button>
							);
						})}
					</div>
				</div>

				{needsWords ? (
					<Field label="Blocked words" hint="One per line. Matching is case-insensitive.">
						<Textarea
							value={work.words.join('\n')}
							onChange={(event) => {
								patch({
									words: event.target.value.split('\n').map((word) => word.trim())
								});
							}}
							className="min-h-24 font-mono"
						/>
					</Field>
				) : null}

				{needsThreshold || needsWindow ? (
					<div className="grid gap-5 sm:grid-cols-2">
						{needsThreshold ? (
							<Field
								label={work.trigger === 'caps' ? 'Percent of capitals' : 'Threshold'}
								hint={work.trigger === 'caps' ? 'Above this share of letters.' : undefined}
							>
								<NumberInput
									min={1}
									max={work.trigger === 'caps' ? 100 : 50}
									value={work.threshold}
									onValueChange={(next) => {
										patch({ threshold: next });
									}}
								/>
							</Field>
						) : null}

						{needsWindow ? (
							<Field label="Within (seconds)">
								<NumberInput
									min={1}
									max={120}
									value={work.windowSeconds}
									onValueChange={(next) => {
										patch({ windowSeconds: next });
									}}
								/>
							</Field>
						) : null}
					</div>
				) : null}

				<div
					className="flex flex-col gap-2 border-t border-border pt-5"
					role="group"
					aria-labelledby={actionsLabelId}
				>
					<span id={actionsLabelId} className="text-body-sm font-medium">
						Then
					</span>
					<div className="flex flex-wrap gap-1.5">
						{ACTIONS.map((action) => {
							const active = work.actions.includes(action.id);
							return (
								<button
									key={action.id}
									type="button"
									aria-pressed={active}
									onClick={() => {
										toggleAction(action.id);
									}}
									className={cn(
										'inline-flex h-7 items-center rounded-sm border px-2.5 text-body-sm transition-colors duration-120 ease-out',
										active
											? 'border-primary bg-primary-subtle text-primary'
											: 'border-border bg-surface text-text-muted hover:border-border-strong hover:text-text'
									)}
								>
									{action.label}
								</button>
							);
						})}
					</div>
					{work.actions.length === 0 ? (
						<p className="text-caption font-normal text-danger">
							Pick at least one action, or the rule does nothing.
						</p>
					) : null}
				</div>

				<div className="grid gap-5 border-t border-border pt-5 sm:grid-cols-2">
					<Field label="Never applies to these roles">
						<RolePicker
							roles={roles}
							value={work.exemptRoleIds}
							onValueChange={(next) => {
								patch({ exemptRoleIds: next });
							}}
							placeholder="No exemptions…"
						/>
					</Field>

					<Field label="Never applies in this channel">
						<ChannelPicker
							channels={channels}
							value={work.exemptChannelIds[0] ?? null}
							onValueChange={(next) => {
								patch({ exemptChannelIds: [next] });
							}}
							placeholder="Applies everywhere…"
						/>
					</Field>
				</div>
			</div>
		</Dialog>
	);
}
