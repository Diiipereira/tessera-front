'use client';

import { GripVertical, Plus, Sticker, Trash2 } from 'lucide-react';
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

const MODES: ReactionMode[] = ['toggle', 'unique', 'verify', 'drop'];

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
	const t = useTranslations('modules.reactionRoles');
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
			aria-label={t('previewLabel')}
			className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-1"
		>
			<h2 className="text-h4">Preview</h2>

			<div className="rounded-lg p-4" style={{ backgroundColor: DISCORD.surface }}>
				<p className="mb-3 text-[15px] text-white">
					{selected.name === '' ? t('defaultName') : selected.name}
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
								{option.label === '' ? t('defaultOption') : option.label}
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

			<p className="text-caption font-normal text-text-muted">{t(`mode.${selected.mode}.blurb`)}</p>
		</section>
	) : undefined;

	return (
		<ModulePage
			moduleId="reaction-roles"
			icon={Sticker}
			title={t('title')}
			description={t('description')}
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
							toast.success(t('saved'));
						});
					}}
					onResolveConflict={form.resolveConflict}
				/>
			}
		>
			<SettingsSection
				title={t('panels.title')}
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
								{panel.name === '' ? t('untitled') : panel.name}
							</button>
						))}
					</div>
				)}
			</SettingsSection>

			{selected ? (
				<>
					<SettingsSection
						title={t('settings.title')}
						action={
							<Button
								variant="ghost-danger"
								size="sm"
								iconOnly
								aria-label={t('settings.delete', {
									name: selected.name === '' ? t('untitled') : selected.name
								})}
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
						<Field label={t('settings.name')} hint={t('settings.nameHint')}>
							<Input
								value={selected.name}
								onChange={(event) => {
									updatePanel(selected.id, { name: event.target.value });
								}}
								placeholder={t('settings.namePlaceholder')}
							/>
						</Field>

						<Field label={t('settings.channel')}>
							<ChannelPicker
								channels={channels}
								value={selected.channelId}
								onValueChange={(next) => {
									updatePanel(selected.id, { channelId: next });
								}}
							/>
						</Field>

						<div className="flex flex-col gap-2">
							<span className="text-body-sm font-medium">{t('settings.mode')}</span>
							<div className="grid gap-2 sm:grid-cols-2">
								{MODES.map((mode) => {
									const active = selected.mode === mode;
									return (
										<button
											key={mode}
											type="button"
											aria-pressed={active}
											onClick={() => {
												updatePanel(selected.id, { mode });
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
												{t(`mode.${mode}.label`)}
											</span>
											<span className="text-caption font-normal text-text-muted">
												{t(`mode.${mode}.blurb`)}
											</span>
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
							label={t('settings.buttons')}
							description={t('settings.buttonsHint')}
						/>
					</SettingsSection>

					<SettingsSection
						title={t('options.title')}
						description={t('options.description')}
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
											<Field label={t('options.label')} className="min-w-40 flex-1">
												<Input
													value={option.label}
													onChange={(event) => {
														updateOption(selected.id, option.id, {
															label: event.target.value
														});
													}}
													placeholder={t('options.labelPlaceholder')}
												/>
											</Field>
										</div>

										<Field label={t('options.role')}>
											<RolePicker
												roles={roles}
												value={option.roleId === null ? [] : [option.roleId]}
												onValueChange={(next) => {
													updateOption(selected.id, option.id, {
														roleId: next.at(-1) ?? null
													});
												}}
											/>
										</Field>
									</div>

									<Button
										variant="ghost-danger"
										size="sm"
										iconOnly
										aria-label={t('options.remove', {
											label: option.label === '' ? t('options.unlabelled') : option.label
										})}
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
