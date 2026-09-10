'use client';

import { GripVertical, Plus, Sticker, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ChannelPicker } from '@/components/discord/ChannelPicker';
import { RolePicker } from '@/components/discord/RolePicker';
import { DiscordPreview } from '@/components/modules/DiscordPreview';
import { MessageComposer } from '@/components/modules/MessageComposer';
import { ModulePage } from '@/components/modules/ModulePage';
import { SaveBar } from '@/components/modules/SaveBar';
import { SettingsSection } from '@/components/modules/SettingsSection';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { useThrownFailure } from '@/lib/hooks/useApiFailure';
import { useConfigDraft, type SaveOutcome } from '@/lib/hooks/useConfigDraft';
import { patchModule } from '@/lib/module-client';
import { loadPanels, savePanels } from '@/lib/reaction-roles-client';
import { toPanelPayload, toReactionRolesConfig, unfinished } from '@/lib/modules/reaction-roles';
import { emptyEmbedDraft } from '@/lib/modules/welcome';
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
import { moveItem } from '@/lib/utils/reorder';

const MODES: ReactionMode[] = ['toggle', 'unique', 'verify', 'drop'];

const MOVES: Record<string, number> = { ArrowUp: -1, ArrowDown: 1 };

function blankPanel(defaultColor: string): ReactionPanel {
	return {
		id: newId('rp'),
		name: '',
		channelId: null,
		message: { mode: 'text', text: '', embed: emptyEmbedDraft(defaultColor) },
		mode: 'toggle',
		useButtons: true,
		options: []
	};
}

type ReactionRolesScreenProps = {
	guildId: string;
	config: ReactionRolesConfig;
	version: number;
	channels: Channel[];
	roles: Role[];
	defaultColor: string;
	botName: string;
	botAvatarUrl: string | null;
};

export function ReactionRolesScreen({
	guildId,
	config,
	version,
	channels,
	roles,
	defaultColor,
	botName,
	botAvatarUrl
}: ReactionRolesScreenProps) {
	const t = useTranslations('modules.reactionRoles');
	const explain = useThrownFailure();
	const preview = useTranslations('modules.preview');
	const versionRef = useRef(version);

	const save = useCallback(
		async (next: ReactionRolesConfig): Promise<SaveOutcome<ReactionRolesConfig>> => {
			const patched = await patchModule(guildId, 'reaction-roles', {
				version: versionRef.current,
				enabled: next.enabled
			});

			if (patched.status === 'error') return patched;

			versionRef.current = patched.state.version;

			if (patched.status === 'conflict') {
				const stored = await loadPanels(guildId);

				if (stored.status === 'error') return stored;

				return {
					status: 'conflict',
					current: toReactionRolesConfig(patched.state, stored.panels)
				};
			}

			const written = await savePanels(guildId, toPanelPayload(next.panels));

			if (written.status === 'error') return written;

			return { status: 'saved', saved: toReactionRolesConfig(patched.state, written.panels) };
		},
		[guildId]
	);

	const form = useConfigDraft<ReactionRolesConfig>(config, { save });
	const draft = form.draft;
	const halfWritten = unfinished(draft.panels);

	const [selectedId, setSelectedId] = useState(draft.panels[0]?.id ?? null);
	const [dragging, setDragging] = useState<string | null>(null);
	const [over, setOver] = useState<string | null>(null);
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

	function moveOption(panelId: string, optionId: string, to: number) {
		const panel = draft.panels.find((entry) => entry.id === panelId);
		if (!panel) return;

		const from = panel.options.findIndex((option) => option.id === optionId);
		if (from === -1) return;

		updatePanel(panelId, { options: moveItem(panel.options, from, to) });
	}

	function endDrag() {
		setDragging(null);
		setOver(null);
	}

	const aside = selected ? (
		<section
			aria-label={t('previewLabel')}
			className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-1"
		>
			<h2 className="text-h4">{preview('title')}</h2>

			<DiscordPreview
				message={selected.message}
				variables={[]}
				botName={botName}
				botAvatarUrl={botAvatarUrl}
				footer={
					selected.options.length === 0 ? (
						<p className="text-[13px]" style={{ color: DISCORD.muted }}>
							{t('noOptions')}
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
					)
				}
			/>

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
						void form
							.save()
							.then(() => {
								toast.success(t('saved'));
							})
							.catch((error: unknown) => {
								toast.error(t('saveFailed'), { description: explain(error) });
							});
					}}
					onResolveConflict={form.resolveConflict}
				/>
			}
		>
			{halfWritten > 0 ? (
				<p className="rounded-md border border-warning bg-warning-subtle px-3 py-2 text-body-sm text-warning-fg">
					{t('halfWritten', { count: halfWritten })}
				</p>
			) : null}

			<SettingsSection
				title={t('panels.title')}
				action={
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							const panel = blankPanel(defaultColor);
							form.set('panels', [...draft.panels, panel]);
							setSelectedId(panel.id);
						}}
					>
						<Plus aria-hidden="true" />
						{t('new')}
					</Button>
				}
			>
				{draft.panels.length === 0 ? (
					<p className="text-body-sm text-text-muted">{t('noPanels')}</p>
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

						<MessageComposer
							value={selected.message}
							onChange={(next) => {
								updatePanel(selected.id, { message: next });
							}}
							variables={[]}
						/>

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
								{t('options.add')}
							</Button>
						}
					>
						{selected.options.length === 0 ? (
							<p className="text-body-sm text-text-muted">{t('options.noneWarning')}</p>
						) : (
							selected.options.map((option, index) => (
								<div
									key={option.id}
									data-option-row=""
									onDragOver={(event) => {
										if (dragging === null) return;

										event.preventDefault();
										event.dataTransfer.dropEffect = 'move';
										setOver(option.id);
									}}
									onDrop={(event) => {
										event.preventDefault();

										if (dragging !== null) moveOption(selected.id, dragging, index);

										endDrag();
									}}
									className={cn(
										'flex items-start gap-2 rounded-md border bg-surface-sunken p-3 transition-colors duration-120 ease-out',
										over === option.id && dragging !== option.id
											? 'border-primary'
											: 'border-border',
										dragging === option.id && 'opacity-50'
									)}
								>
									<button
										type="button"
										draggable
										aria-label={t('options.move', {
											position: index + 1,
											total: selected.options.length
										})}
										title={t('options.moveHint')}
										onDragStart={(event) => {
											const row = event.currentTarget.closest('[data-option-row]');

											event.dataTransfer.effectAllowed = 'move';
											event.dataTransfer.setData('text/plain', option.id);

											if (row instanceof HTMLElement) event.dataTransfer.setDragImage(row, 16, 16);

											setDragging(option.id);
										}}
										onDragEnd={endDrag}
										onKeyDown={(event) => {
											const step = MOVES[event.key];

											if (step === undefined) return;

											event.preventDefault();
											moveOption(selected.id, option.id, index + step);
										}}
										className="mt-2.5 shrink-0 cursor-grab rounded-sm text-text-subtle transition-colors duration-120 ease-out hover:text-text active:cursor-grabbing"
									>
										<GripVertical className="size-4" aria-hidden="true" />
									</button>

									<div className="flex min-w-0 flex-1 flex-col gap-2">
										<div className="flex flex-wrap items-end gap-2">
											<Field label={t('options.emoji')} className="w-20">
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
