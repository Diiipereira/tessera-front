'use client';

import { GripVertical, Plus, Sticker, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ChannelPicker } from '@/components/discord/ChannelPicker';
import { RolePicker } from '@/components/discord/RolePicker';
import { ModulePage } from '@/components/modules/ModulePage';
import { SaveBar } from '@/components/modules/SaveBar';
import { SettingsSection } from '@/components/modules/SettingsSection';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { useConfigDraft } from '@/lib/hooks/useConfigDraft';
import type { Channel, Role } from '@/lib/types/discord';
import type {
	ReactionMode,
	ReactionOption,
	ReactionPanel,
	ReactionRolesConfig
} from '@/lib/types/module-configs';
import { DISCORD } from '@/lib/discord-colors';
import { cn } from '@/lib/utils/cn';
import { newId } from '@/lib/utils/id';

const MODES: { id: ReactionMode; label: string; blurb: string }[] = [
	{ id: 'toggle', label: 'Toggle', blurb: 'Press to get it, press again to drop it.' },
	{ id: 'unique', label: 'Unique', blurb: 'Only one of these roles at a time.' },
	{ id: 'verify', label: 'Verify', blurb: 'One-way — the role can only be gained.' },
	{ id: 'drop', label: 'Drop', blurb: 'One-way — the role can only be removed.' }
];

function blankPanel(): ReactionPanel {
	return {
		id: newId('rp'),
		name: '',
		channelId: null,
		mode: 'toggle',
		useButtons: true,
		options: []
	};
}

type ReactionRolesScreenProps = {
	config: ReactionRolesConfig;
	channels: Channel[];
	roles: Role[];
};

export function ReactionRolesScreen({ config, channels, roles }: ReactionRolesScreenProps) {
	const form = useConfigDraft<ReactionRolesConfig>(config);
	const draft = form.draft;

	const [selectedId, setSelectedId] = useState(draft.panels[0]?.id ?? null);
	const selected = draft.panels.find((panel) => panel.id === selectedId) ?? null;

	function updatePanel(id: string, patch: Partial<ReactionPanel>) {
		form.set(
			'panels',
			draft.panels.map((panel) => (panel.id === id ? { ...panel, ...patch } : panel))
		);
	}

	function updateOption(panelId: string, optionId: string, patch: Partial<ReactionOption>) {
		const panel = draft.panels.find((entry) => entry.id === panelId);
		if (!panel) return;
		updatePanel(panelId, {
			options: panel.options.map((option) =>
				option.id === optionId ? { ...option, ...patch } : option
			)
		});
	}

	const aside = selected ? (
		<section
			aria-label="Panel preview"
			className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-1"
		>
			<h2 className="text-h4">Preview</h2>

			<div className="rounded-lg p-4" style={{ backgroundColor: DISCORD.surface }}>
				<p className="mb-3 text-[15px] text-white">
					{selected.name === '' ? 'Pick your roles' : selected.name}
				</p>

				{selected.options.length === 0 ? (
					<p className="text-[13px]" style={{ color: DISCORD.muted }}>
						No options yet.
					</p>
				) : selected.useButtons ? (
					<div className="flex flex-wrap gap-2">
						{selected.options.map((option) => (
							<span
								key={option.id}
								className="inline-flex h-8 items-center gap-1.5 rounded-[3px] px-3 text-[14px] font-medium text-white"
								style={{ backgroundColor: DISCORD.button }}
							>
								<span aria-hidden="true">{option.emoji}</span>
								{option.label === '' ? 'Role' : option.label}
							</span>
						))}
					</div>
				) : (
					<div className="flex flex-wrap gap-1.5">
						{selected.options.map((option) => (
							<span
								key={option.id}
								className="inline-flex h-6 items-center gap-1 rounded-md px-2 text-[13px]"
								style={{ backgroundColor: DISCORD.reaction, color: DISCORD.text }}
							>
								<span aria-hidden="true">{option.emoji}</span>
								<span className="tabular">1</span>
							</span>
						))}
					</div>
				)}
			</div>

			<p className="text-caption font-normal text-text-muted">
				{MODES.find((mode) => mode.id === selected.mode)?.blurb}
			</p>
		</section>
	) : undefined;

	return (
		<ModulePage
			moduleId="reaction-roles"
			icon={Sticker}
			title="Reaction roles"
			description="Members pick their own roles, without asking staff."
			enabled={draft.enabled}
			onEnabledChange={(next) => {
				form.set('enabled', next);
			}}
			aside={aside}
			saveBar={
				<SaveBar
					dirty={form.dirty}
					changedCount={form.changedCount}
					state={form.state}
					onDiscard={form.discard}
					onSave={() => {
						void form.save().then(() => {
							toast.success('Reaction roles saved');
						});
					}}
					onResolveConflict={form.resolveConflict}
				/>
			}
		>
			<SettingsSection
				title="Panels"
				action={
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							const panel = blankPanel();
							form.set('panels', [...draft.panels, panel]);
							setSelectedId(panel.id);
						}}
					>
						<Plus aria-hidden="true" />
						New panel
					</Button>
				}
			>
				{draft.panels.length === 0 ? (
					<p className="text-body-sm text-text-muted">No panels yet.</p>
				) : (
					<div className="flex flex-wrap gap-2">
						{draft.panels.map((panel) => (
							<button
								key={panel.id}
								type="button"
								aria-pressed={panel.id === selectedId}
								onClick={() => {
									setSelectedId(panel.id);
								}}
								className={cn(
									'inline-flex h-8 items-center rounded-md border px-3 text-body-sm transition-colors duration-120 ease-out',
									panel.id === selectedId
										? 'border-primary bg-primary-subtle text-primary'
										: 'border-border bg-surface text-text-muted hover:border-border-strong hover:text-text'
								)}
							>
								{panel.name === '' ? 'Untitled panel' : panel.name}
							</button>
						))}
					</div>
				)}
			</SettingsSection>

			{selected ? (
				<>
					<SettingsSection
						title="Panel settings"
						action={
							<Button
								variant="ghost-danger"
								size="sm"
								iconOnly
								aria-label={`Delete ${selected.name === '' ? 'untitled panel' : selected.name}`}
								onClick={() => {
									const rest = draft.panels.filter((panel) => panel.id !== selected.id);
									form.set('panels', rest);
									setSelectedId(rest[0]?.id ?? null);
								}}
							>
								<Trash2 aria-hidden="true" />
							</Button>
						}
					>
						<Field label="Panel name" hint="Shown as the message above the options.">
							<Input
								value={selected.name}
								onChange={(event) => {
									updatePanel(selected.id, { name: event.target.value });
								}}
								placeholder="Pick your colours"
							/>
						</Field>

						<Field label="Channel">
							<ChannelPicker
								channels={channels}
								value={selected.channelId}
								onValueChange={(next) => {
									updatePanel(selected.id, { channelId: next });
								}}
							/>
						</Field>

						<div className="flex flex-col gap-2">
							<span className="text-body-sm font-medium">Mode</span>
							<div className="grid gap-2 sm:grid-cols-2">
								{MODES.map((mode) => {
									const active = selected.mode === mode.id;
									return (
										<button
											key={mode.id}
											type="button"
											aria-pressed={active}
											onClick={() => {
												updatePanel(selected.id, { mode: mode.id });
											}}
											className={cn(
												'flex flex-col items-start gap-0.5 rounded-lg border p-3 text-left transition-colors duration-120 ease-out',
												active
													? 'border-primary bg-primary-subtle'
													: 'border-border bg-surface hover:border-border-strong'
											)}
										>
											<span
												className={cn(
													'text-body-sm font-medium',
													active ? 'text-primary' : 'text-text'
												)}
											>
												{mode.label}
											</span>
											<span className="text-caption font-normal text-text-muted">{mode.blurb}</span>
										</button>
									);
								})}
							</div>
						</div>

						<Switch
							checked={selected.useButtons}
							onCheckedChange={(next) => {
								updatePanel(selected.id, { useButtons: next });
							}}
							label="Use buttons instead of reactions"
							description="Buttons are clearer and cannot be removed by accident."
						/>
					</SettingsSection>

					<SettingsSection
						title="Options"
						description="One row per role a member can pick."
						action={
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									updatePanel(selected.id, {
										options: [
											...selected.options,
											{
												id: newId('o'),
												emoji: '⭐',
												roleId: null,
												label: '',
												description: ''
											}
										]
									});
								}}
							>
								<Plus aria-hidden="true" />
								Add option
							</Button>
						}
					>
						{selected.options.length === 0 ? (
							<p className="text-body-sm text-text-muted">
								No options. The panel would post an empty message.
							</p>
						) : (
							selected.options.map((option) => (
								<div
									key={option.id}
									className="flex items-start gap-2 rounded-md border border-border bg-surface-sunken p-3"
								>
									<GripVertical
										className="mt-2.5 size-4 shrink-0 cursor-grab text-text-subtle"
										aria-hidden="true"
									/>

									<div className="flex min-w-0 flex-1 flex-col gap-2">
										<div className="flex flex-wrap items-end gap-2">
											<Field label="Emoji" className="w-20">
												<Input
													value={option.emoji}
													onChange={(event) => {
														updateOption(selected.id, option.id, {
															emoji: event.target.value
														});
													}}
													maxLength={4}
													className="text-center"
												/>
											</Field>
											<Field label="Label" className="min-w-40 flex-1">
												<Input
													value={option.label}
													onChange={(event) => {
														updateOption(selected.id, option.id, {
															label: event.target.value
														});
													}}
													placeholder="Blue"
												/>
											</Field>
										</div>

										<Field label="Role">
											<RolePicker
												roles={roles}
												value={option.roleId === null ? [] : [option.roleId]}
												onValueChange={(next) => {
													updateOption(selected.id, option.id, {
														roleId: next.at(-1) ?? null
													});
												}}
												placeholder="Pick a role…"
											/>
										</Field>
									</div>

									<Button
										variant="ghost-danger"
										size="sm"
										iconOnly
										aria-label={`Remove option ${option.label === '' ? 'without a label' : option.label}`}
										onClick={() => {
											updatePanel(selected.id, {
												options: selected.options.filter((entry) => entry.id !== option.id)
											});
										}}
									>
										<Trash2 aria-hidden="true" />
									</Button>
								</div>
							))
						)}
					</SettingsSection>
				</>
			) : null}
		</ModulePage>
	);
}
