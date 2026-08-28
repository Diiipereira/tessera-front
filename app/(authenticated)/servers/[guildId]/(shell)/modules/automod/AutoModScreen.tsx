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
import { useTranslations } from 'next-intl';
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
import { evaluateMessage, untestableTriggers, type HitReason } from '@/lib/automod';
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

const TRIGGERS: { id: AutoModTrigger; icon: LucideIcon }[] = [
	{ id: 'spam', icon: MessageSquareWarning },
	{ id: 'invites', icon: Ticket },
	{ id: 'links', icon: Link2 },
	{ id: 'caps', icon: CaseUpper },
	{ id: 'mentions', icon: AtSign },
	{ id: 'words', icon: Type },
	{ id: 'attachments', icon: Paperclip }
];

const ACTIONS: AutoModAction[] = ['delete', 'warn', 'timeout', 'kick', 'ban', 'log'];

const ACTION_VARIANTS: Record<AutoModAction, BadgeVariant> = {
	delete: 'neutral',
	warn: 'warning',
	timeout: 'warning',
	kick: 'danger',
	ban: 'danger',
	log: 'info'
};

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
	const t = useTranslations('modules.automod');
	const form = useConfigDraft<AutoModConfig>(config);
	const draft = form.draft;

	const [editing, setEditing] = useState<AutoModRule | null>(null);
	const [isNew, setIsNew] = useState(false);
	const [sample, setSample] = useState('CHECK THIS OUT discord.gg/freestuff @everyone');

	const hits = evaluateMessage(sample, draft.rules);
	const untestable = untestableTriggers(draft.rules);

	function summaryFor(rule: AutoModRule): string {
		return t(`summary.${rule.trigger}`, {
			threshold: rule.threshold,
			window: rule.windowSeconds,
			count: rule.words.length
		});
	}

	function reasonFor(reason: HitReason): string {
		if (reason.kind === 'words') return t('reason.words', { found: reason.found.join(', ') });
		if (reason.kind === 'caps') {
			return t('reason.caps', { ratio: reason.ratio, limit: reason.limit });
		}
		if (reason.kind === 'mentions') {
			return t('reason.mentions', { count: reason.count, limit: reason.limit });
		}

		return t(`reason.${reason.kind}`, { count: reason.count });
	}

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
							toast.success(t('saved'));
						});
					}}
					onResolveConflict={form.resolveConflict}
				/>
			}
		>
			<SettingsSection title={t('rules.title')} description={t('rules.description')}>
				{draft.rules.length === 0 ? (
					<p className="text-body-sm text-text-muted">{t('rules.empty')}</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full min-w-160 border-collapse">
							<thead>
								<tr className="border-b border-border text-left">
									{RULE_COLUMNS.map((column) => (
										<th
											key={column.key}
											className="pb-2 font-mono text-overline font-semibold text-text-muted uppercase"
										>
											{column.hidden ? (
												<span className="sr-only">{t(`rules.${column.key}`)}</span>
											) : (
												t(`rules.${column.key}`)
											)}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{draft.rules.map((rule) => {
									const label = rule.name === '' ? t('untitled') : rule.name;
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
													{t(`trigger.${rule.trigger}.label`)}
												</p>
											</td>
											<td className="py-3 pr-3 text-body-sm text-text-muted">{summaryFor(rule)}</td>
											<td className="py-3 pr-3">
												<div className="flex flex-wrap gap-1">
													{rule.actions.map((action) => (
														<Badge key={action} variant={ACTION_VARIANTS[action]}>
															{t(`action.${action}`)}
														</Badge>
													))}
												</div>
											</td>
											<td className="py-3 pr-3">
												<Switch
													checked={rule.enabled}
													aria-label={t('rules.enable', { name: label })}
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
														aria-label={t('rules.edit', { name: label })}
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
														aria-label={t('rules.delete', { name: label })}
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

			<SettingsSection title={t('playground.title')} description={t('playground.description')}>
				<Field label={t('playground.sample')}>
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
						<p className="text-body-sm text-text-muted">{t('playground.clear')}</p>
					) : (
						<ul className="flex flex-col gap-2">
							{hits.map((hit) => (
								<li key={hit.rule.id} className="flex items-start gap-2">
									<TriangleAlert
										className="mt-0.5 size-3.5 shrink-0 text-warning"
										aria-hidden="true"
									/>
									<span className="text-body-sm text-warning-fg">
										<span className="font-medium">{hit.rule.name}</span> {t('playground.fires')}{' '}
										&mdash; {reasonFor(hit.reason)}
									</span>
								</li>
							))}
						</ul>
					)}
				</div>

				{untestable.length > 0 ? (
					<p className="text-caption font-normal text-text-muted">
						{t('playground.untestable', {
							names: untestable.map((rule) => rule.name).join(', '),
							count: untestable.length
						})}
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

const RULE_COLUMNS: { key: string; hidden?: boolean }[] = [
	{ key: 'rule' },
	{ key: 'firesOn' },
	{ key: 'then' },
	{ key: 'enabled', hidden: true },
	{ key: 'actions', hidden: true }
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
	const t = useTranslations('modules.automod');
	const shared = useTranslations('common');
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
			title={isNew ? t('dialog.new') : t('dialog.edit')}
			description={t('dialog.description')}
			size="lg"
			footer={
				<>
					<Button variant="ghost" onClick={onCancel}>
						{shared('cancel')}
					</Button>
					<Button
						disabled={work.actions.length === 0}
						onClick={() => {
							onSave(work);
						}}
					>
						{isNew ? t('dialog.create') : t('dialog.save')}
					</Button>
				</>
			}
		>
			<div className="flex flex-col gap-5">
				<Field label={t('dialog.name')}>
					<Input
						value={work.name}
						onChange={(event) => {
							patch({ name: event.target.value });
						}}
						placeholder={t('dialog.namePlaceholder')}
					/>
				</Field>

				<div className="flex flex-col gap-2" role="group" aria-labelledby={triggerLabelId}>
					<span id={triggerLabelId} className="text-body-sm font-medium">
						{t('rules.firesOn')}
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
											{t(`trigger.${trigger.id}.label`)}
										</span>
									</span>
									<span className="text-caption font-normal text-pretty text-text-muted">
										{t(`trigger.${trigger.id}.blurb`)}
									</span>
								</button>
							);
						})}
					</div>
				</div>

				{needsWords ? (
					<Field label={t('dialog.words')} hint={t('dialog.wordsHint')}>
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
								label={work.trigger === 'caps' ? t('dialog.percent') : t('dialog.threshold')}
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
							<Field label={t('dialog.window')}>
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
						{t('rules.then')}
					</span>
					<div className="flex flex-wrap gap-1.5">
						{ACTIONS.map((action) => {
							const active = work.actions.includes(action);
							return (
								<button
									key={action}
									type="button"
									aria-pressed={active}
									onClick={() => {
										toggleAction(action);
									}}
									className={cn(
										'inline-flex h-7 items-center rounded-sm border px-2.5 text-body-sm transition-colors duration-120 ease-out',
										active
											? 'border-primary bg-primary-subtle text-primary'
											: 'border-border bg-surface text-text-muted hover:border-border-strong hover:text-text'
									)}
								>
									{t(`action.${action}`)}
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
					<Field label={t('dialog.exemptRoles')}>
						<RolePicker
							roles={roles}
							value={work.exemptRoleIds}
							onValueChange={(next) => {
								patch({ exemptRoleIds: next });
							}}
							placeholder={t('dialog.exemptRolesPlaceholder')}
						/>
					</Field>

					<Field label={t('dialog.exemptChannel')}>
						<ChannelPicker
							channels={channels}
							value={work.exemptChannelIds[0] ?? null}
							onValueChange={(next) => {
								patch({ exemptChannelIds: [next] });
							}}
							placeholder={t('dialog.exemptChannelPlaceholder')}
						/>
					</Field>
				</div>
			</div>
		</Dialog>
	);
}
