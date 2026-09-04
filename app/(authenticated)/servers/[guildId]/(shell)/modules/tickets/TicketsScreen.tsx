'use client';

import { Plus, Ticket, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ChannelPicker } from '@/components/discord/ChannelPicker';
import { RolePicker } from '@/components/discord/RolePicker';
import { Avatar } from '@/components/layout/Avatar';
import { DiscordPreview } from '@/components/modules/DiscordPreview';
import { MessageComposer } from '@/components/modules/MessageComposer';
import { ModulePage } from '@/components/modules/ModulePage';
import { SaveBar } from '@/components/modules/SaveBar';
import { SettingsSection } from '@/components/modules/SettingsSection';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { NumberInput } from '@/components/ui/NumberInput';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Switch } from '@/components/ui/Switch';
import { EMBED_SWATCHES } from '@/lib/discord-colors';
import { useConfigDraft, type SaveOutcome } from '@/lib/hooks/useConfigDraft';
import { useRelativeTime } from '@/lib/hooks/useRelativeTime';
import { patchModule } from '@/lib/module-client';
import {
	CATEGORY_KINDS,
	DEFAULT_NAMING_PATTERN,
	MAX_AUTO_CLOSE_HOURS,
	MAX_BUTTON_LABEL_LENGTH,
	MAX_CLOSE_DELAY_SECONDS,
	MAX_NAMING_PATTERN_LENGTH,
	MAX_OPEN_PER_USER,
	MAX_PANEL_NAME_LENGTH,
	MAX_PANELS,
	MAX_STAFF_ROLES,
	PANEL_CHANNEL_KINDS,
	TRANSCRIPT_CHANNEL_KINDS,
	nameless,
	toPanelPayload,
	toTicketsConfig,
	toTicketsPatch
} from '@/lib/modules/tickets';
import { loadPanels, savePanels } from '@/lib/tickets-client';
import type { Channel, Role } from '@/lib/types/discord';
import type {
	OpenTicket,
	TicketPanel,
	TicketStatus,
	TicketsConfig
} from '@/lib/types/module-configs';
import type { MessageVariable } from '@/lib/types/modules';
import { newId } from '@/lib/utils/id';

const TICKET_COLUMNS = ['number', 'subject', 'openedBy', 'claimedBy', 'age', 'status'];

const STATUS_VARIANTS: Record<TicketStatus, BadgeVariant> = {
	open: 'warning',
	claimed: 'info',
	closed: 'neutral',
	archived: 'neutral'
};

function blankPanel(buttonLabel: string, text: string): TicketPanel {
	return {
		id: newId('panel'),
		name: '',
		channelId: null,
		categoryId: null,
		staffRoleIds: [],
		namingPattern: DEFAULT_NAMING_PATTERN,
		maxOpenPerUser: 1,
		buttonLabel,
		buttonEmoji: null,
		enabled: true,
		message: {
			mode: 'text',
			text,
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

type TicketsScreenProps = {
	guildId: string;
	config: TicketsConfig;
	defaultColor: string;
	version: number;
	channels: Channel[];
	roles: Role[];
	variables: MessageVariable[];
	openTickets: OpenTicket[];
	now: string;
};

export function TicketsScreen({
	guildId,
	config,
	defaultColor,
	version,
	channels,
	roles,
	variables,
	openTickets,
	now
}: TicketsScreenProps) {
	const t = useTranslations('modules.tickets');
	const preview = useTranslations('modules.preview');
	const relativeTime = useRelativeTime();
	const rightNow = new Date(now);
	const versionRef = useRef(version);

	const save = useCallback(
		async (next: TicketsConfig): Promise<SaveOutcome<TicketsConfig>> => {
			const patched = await patchModule(guildId, 'tickets', {
				version: versionRef.current,
				enabled: next.enabled,
				config: toTicketsPatch(next)
			});

			if (patched.status === 'error') return patched;

			versionRef.current = patched.state.version;

			if (patched.status === 'conflict') {
				const stored = await loadPanels(guildId);

				if (stored.status === 'error') return stored;

				return {
					status: 'conflict',
					current: toTicketsConfig(patched.state, stored.panels, defaultColor)
				};
			}

			const written = await savePanels(guildId, toPanelPayload(next.panels));

			if (written.status === 'error') return written;

			return {
				status: 'saved',
				saved: toTicketsConfig(patched.state, written.panels, defaultColor)
			};
		},
		[guildId, defaultColor]
	);

	const form = useConfigDraft<TicketsConfig>(config, { save });
	const draft = form.draft;

	const [tab, setTab] = useState<'panels' | 'open'>('panels');
	const [selectedId, setSelectedId] = useState(draft.panels[0]?.id ?? null);

	const selected = draft.panels.find((panel) => panel.id === selectedId) ?? null;
	const unnamed = nameless(draft.panels);

	function updatePanel(id: string, patch: Partial<TicketPanel>) {
		form.set(
			'panels',
			draft.panels.map((panel) => (panel.id === id ? { ...panel, ...patch } : panel))
		);
	}

	const aside =
		tab === 'panels' && selected ? (
			<section
				aria-label={t('preview.label')}
				className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-1"
			>
				<h2 className="text-h4">{preview('title')}</h2>
				<DiscordPreview message={selected.message} variables={variables} />
				<div className="rounded-md border border-border bg-surface-sunken p-3">
					<p className="mb-2 text-caption font-normal text-text-muted">{t('preview.buttonHint')}</p>
					<span className="inline-flex h-8 items-center rounded-sm bg-discord px-4 text-body-sm font-medium text-discord-fg">
						{selected.buttonLabel === '' ? t('preview.defaultButton') : selected.buttonLabel}
					</span>
				</div>
				<p className="text-caption font-normal text-text-muted">
					{t.rich('preview.landsAs', {
						name: selected.namingPattern.replace('{number}', '185').replace('{user}', 'novato'),
						code: (chunks) => <span className="font-mono text-text">{chunks}</span>
					})}
				</p>
			</section>
		) : undefined;

	return (
		<ModulePage
			moduleId="tickets"
			icon={Ticket}
			title={t('title')}
			description={t('description')}
			enabled={draft.enabled}
			onEnabledChange={(next) => {
				form.set('enabled', next);
			}}
			headerAction={
				<SegmentedControl
					options={[
						{ value: 'panels', label: t('tabPanels'), count: draft.panels.length },
						{ value: 'open', label: t('tabOpen'), count: openTickets.length }
					]}
					value={tab}
					onValueChange={setTab}
					label={t('view')}
					size="sm"
				/>
			}
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
			{tab === 'open' ? (
				<SettingsSection title={t('open.title')} description={t('open.description')}>
					{openTickets.length === 0 ? (
						<p className="text-body-sm text-text-muted">{t('open.empty')}</p>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full min-w-160 border-collapse">
								<thead>
									<tr className="border-b border-border text-left">
										{TICKET_COLUMNS.map((head) => (
											<th
												key={head}
												className="pb-2 font-mono text-overline font-semibold text-text-muted uppercase"
											>
												{t(`open.${head}`)}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{openTickets.map((ticket) => (
										<tr key={ticket.id} className="border-b border-border last:border-0">
											<td className="tabular py-3 pr-3 font-mono text-body-sm text-text-muted">
												{ticket.number}
											</td>
											<td className="py-3 pr-3 text-body">
												{ticket.subject === '' ? '—' : ticket.subject}
											</td>
											<td className="py-3 pr-3">
												<span className="flex items-center gap-2">
													<Avatar
														initials={ticket.openerInitials}
														color={ticket.openerColor}
														shape="circle"
														size="sm"
													/>
													<span className="text-body-sm">{ticket.openerName}</span>
												</span>
											</td>
											<td className="py-3 pr-3 text-body-sm text-text-muted">
												{ticket.claimedBy ?? '—'}
											</td>
											<td className="py-3 pr-3 text-body-sm text-text-muted">
												{relativeTime(ticket.openedAt, rightNow)}
											</td>
											<td className="py-3">
												<Badge variant={STATUS_VARIANTS[ticket.status]} dot>
													{t(`status.${ticket.status}`)}
												</Badge>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</SettingsSection>
			) : (
				<>
					<SettingsSection
						title={t('panels.title')}
						description={t('panels.description')}
						action={
							<Button
								variant="outline"
								size="sm"
								disabled={draft.panels.length >= MAX_PANELS}
								onClick={() => {
									const panel = blankPanel(t('panels.seedButton'), t('panels.seedMessage'));
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
							<p className="text-body-sm text-text-muted">{t('panels.empty')}</p>
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
										className={
											panel.id === selectedId
												? 'inline-flex h-8 items-center rounded-md border border-primary bg-primary-subtle px-3 text-body-sm text-primary'
												: 'inline-flex h-8 items-center rounded-md border border-border bg-surface px-3 text-body-sm text-text-muted transition-colors duration-120 ease-out hover:border-border-strong hover:text-text'
										}
									>
										{panel.name === '' ? t('untitled') : panel.name}
									</button>
								))}
							</div>
						)}

						{unnamed > 0 ? (
							<p className="rounded-md border border-warning bg-warning-subtle px-3 py-2 text-body-sm text-warning-fg">
								{t('panels.unnamed', { count: unnamed })}
							</p>
						) : null}
					</SettingsSection>

					{selected ? (
						<>
							<SettingsSection
								title={t('panels.settings')}
								action={
									<Button
										variant="ghost-danger"
										size="sm"
										iconOnly
										aria-label={t('panels.delete', {
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
								<Field label={t('panels.name')} hint={t('panels.nameHint')}>
									<Input
										value={selected.name}
										maxLength={MAX_PANEL_NAME_LENGTH}
										onChange={(event) => {
											updatePanel(selected.id, { name: event.target.value });
										}}
										placeholder={t('panels.namePlaceholder')}
									/>
								</Field>

								<Field label={t('panels.channel')} hint={t('panels.channelHint')}>
									<ChannelPicker
										channels={channels}
										kinds={PANEL_CHANNEL_KINDS}
										value={selected.channelId}
										onValueChange={(next) => {
											updatePanel(selected.id, { channelId: next });
										}}
									/>
								</Field>

								<Field label={t('panels.category')} hint={t('panels.categoryHint')}>
									<ChannelPicker
										channels={channels}
										kinds={CATEGORY_KINDS}
										value={selected.categoryId}
										onValueChange={(next) => {
											updatePanel(selected.id, { categoryId: next });
										}}
									/>
								</Field>

								<Field label={t('panels.staff')} hint={t('panels.staffHint')}>
									<RolePicker
										roles={roles}
										value={selected.staffRoleIds}
										onValueChange={(next) => {
											updatePanel(selected.id, { staffRoleIds: next.slice(0, MAX_STAFF_ROLES) });
										}}
									/>
								</Field>

								<div className="flex flex-wrap items-end gap-4">
									<Field
										label={t('panels.naming')}
										hint={t('panels.namingHint')}
										className="min-w-56 flex-1"
									>
										<Input
											value={selected.namingPattern}
											maxLength={MAX_NAMING_PATTERN_LENGTH}
											onChange={(event) => {
												updatePanel(selected.id, { namingPattern: event.target.value });
											}}
											className="font-mono"
										/>
									</Field>
									<Field label={t('panels.maxOpen')} className="w-44">
										<NumberInput
											min={1}
											max={MAX_OPEN_PER_USER}
											value={selected.maxOpenPerUser}
											onValueChange={(next) => {
												updatePanel(selected.id, { maxOpenPerUser: next });
											}}
										/>
									</Field>
								</div>

								<Field label={t('panels.button')}>
									<Input
										value={selected.buttonLabel}
										onChange={(event) => {
											updatePanel(selected.id, { buttonLabel: event.target.value });
										}}
										maxLength={MAX_BUTTON_LABEL_LENGTH}
									/>
								</Field>

								<Switch
									checked={selected.enabled}
									onCheckedChange={(next) => {
										updatePanel(selected.id, { enabled: next });
									}}
									label={t('panels.enabled')}
									description={t('panels.enabledHint')}
								/>
							</SettingsSection>

							<SettingsSection
								title={t('panels.messageTitle')}
								description={t('panels.messageDescription')}
							>
								<MessageComposer
									value={selected.message}
									onChange={(next) => {
										updatePanel(selected.id, { message: next });
									}}
									variables={variables}
								/>
							</SettingsSection>
						</>
					) : null}

					<SettingsSection title={t('behaviour.title')} description={t('behaviour.description')}>
						<Field label={t('behaviour.transcript')} hint={t('behaviour.transcriptHint')}>
							<ChannelPicker
								channels={channels}
								kinds={TRANSCRIPT_CHANNEL_KINDS}
								value={draft.transcriptChannelId}
								onValueChange={(next) => {
									form.set('transcriptChannelId', next);
								}}
							/>
						</Field>

						<Switch
							checked={draft.askForRating}
							onCheckedChange={(next) => {
								form.set('askForRating', next);
							}}
							label={t('behaviour.rating')}
							description={t('behaviour.ratingHint')}
						/>

						<div className="flex flex-wrap items-end gap-4">
							<Field
								label={t('behaviour.autoClose')}
								hint={t('behaviour.autoCloseHint')}
								className="w-56"
							>
								<NumberInput
									min={0}
									max={MAX_AUTO_CLOSE_HOURS}
									value={draft.autoCloseHours}
									onValueChange={(next) => {
										form.set('autoCloseHours', next);
									}}
								/>
							</Field>

							<Field
								label={t('behaviour.closeDelay')}
								hint={t('behaviour.closeDelayHint')}
								className="w-56"
							>
								<NumberInput
									min={0}
									max={MAX_CLOSE_DELAY_SECONDS}
									value={draft.closeDelaySeconds}
									onValueChange={(next) => {
										form.set('closeDelaySeconds', next);
									}}
								/>
							</Field>
						</div>
					</SettingsSection>
				</>
			)}
		</ModulePage>
	);
}
