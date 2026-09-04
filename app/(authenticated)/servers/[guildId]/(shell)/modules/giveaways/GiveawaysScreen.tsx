'use client';

import { CircleStop, Dices, Gift, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { ChannelPicker } from '@/components/discord/ChannelPicker';
import { RolePicker } from '@/components/discord/RolePicker';
import { Avatar } from '@/components/layout/Avatar';
import { ModulePage } from '@/components/modules/ModulePage';
import { SaveBar } from '@/components/modules/SaveBar';
import { SettingsSection } from '@/components/modules/SettingsSection';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { NumberInput } from '@/components/ui/NumberInput';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import {
	endGiveaway,
	removeGiveaway,
	rerollGiveaway,
	startGiveaway,
	type GiveawayResult
} from '@/lib/giveaways-client';
import { useConfigDraft, type SaveOutcome } from '@/lib/hooks/useConfigDraft';
import { useRelativeTime } from '@/lib/hooks/useRelativeTime';
import { patchModule } from '@/lib/module-client';
import {
	GIVEAWAY_CHANNEL_KINDS,
	MAX_GIVEAWAY_DESCRIPTION_LENGTH,
	MAX_GIVEAWAY_HOURS,
	MAX_PRIZE_LENGTH,
	MAX_REQUIRED_LEVEL,
	MAX_REQUIRED_ROLES,
	MAX_WINNERS,
	countBy,
	toGiveaway,
	toGiveawaysConfig,
	toGiveawaysPatch,
	toStartPayload
} from '@/lib/modules/giveaways';
import type { Channel, Role } from '@/lib/types/discord';
import type { Giveaway, GiveawayState, GiveawaysConfig } from '@/lib/types/module-configs';
import { formatCount } from '@/lib/utils/format';

const TAB_KEY = { active: 'Active', ended: 'Ended' } as const;

type GiveawaysScreenProps = {
	guildId: string;
	config: GiveawaysConfig;
	version: number;
	giveaways: Giveaway[];
	channels: Channel[];
	roles: Role[];
	now: string;
};

export function GiveawaysScreen({
	guildId,
	config,
	version,
	giveaways,
	channels,
	roles,
	now
}: GiveawaysScreenProps) {
	const t = useTranslations('modules.giveaways');
	const relativeTime = useRelativeTime();
	const rightNow = new Date(now);
	const versionRef = useRef(version);

	const save = useCallback(
		async (next: GiveawaysConfig): Promise<SaveOutcome<GiveawaysConfig>> => {
			const patched = await patchModule(guildId, 'giveaways', {
				version: versionRef.current,
				enabled: next.enabled,
				config: toGiveawaysPatch(next)
			});

			if (patched.status === 'error') return patched;

			versionRef.current = patched.state.version;

			return patched.status === 'conflict'
				? { status: 'conflict', current: toGiveawaysConfig(patched.state) }
				: { status: 'saved', saved: toGiveawaysConfig(patched.state) };
		},
		[guildId]
	);

	const form = useConfigDraft<GiveawaysConfig>(config, { save });
	const draft = form.draft;

	const [rows, setRows] = useState<Giveaway[]>(giveaways);
	const [tab, setTab] = useState<GiveawayState>('active');
	const [creating, setCreating] = useState(false);
	const [busyId, setBusyId] = useState<string | null>(null);
	const [, startTransition] = useTransition();

	const counts: Record<GiveawayState, number> = {
		active: countBy(rows, 'active'),
		ended: countBy(rows, 'ended')
	};

	const visible = rows.filter((giveaway) => giveaway.state === tab);

	const replace = (giveaway: Giveaway) => {
		setRows((current) => current.map((entry) => (entry.id === giveaway.id ? giveaway : entry)));
	};

	const act = (giveaway: Giveaway, run: () => Promise<GiveawayResult>, success: string) => {
		setBusyId(giveaway.id);

		startTransition(() => {
			void run()
				.then((result) => {
					if (result.status === 'error') {
						toast.error(result.message);
						return;
					}

					replace(toGiveaway(result.giveaway));
					toast.success(success);
				})
				.finally(() => {
					setBusyId(null);
				});
		});
	};

	return (
		<ModulePage
			moduleId="giveaways"
			icon={Gift}
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
						setCreating(true);
					}}
				>
					<Plus aria-hidden="true" />
					{t('create.open')}
				</Button>
			}
			saveBar={
				<SaveBar
					dirty={form.dirty}
					changedCount={form.changedCount}
					state={form.state}
					onDiscard={form.discard}
					onSave={() => {
						void form.save().then((state) => {
							if (state === 'idle') toast.success(t('saved'));
						});
					}}
					onResolveConflict={form.resolveConflict}
				/>
			}
		>
			<SettingsSection
				title={t('list.title')}
				action={
					<SegmentedControl
						options={[
							{ value: 'active', label: t('list.active'), count: counts.active },
							{ value: 'ended', label: t('list.ended'), count: counts.ended }
						]}
						value={tab}
						onValueChange={setTab}
						label={t('list.state')}
						size="sm"
					/>
				}
			>
				{visible.length === 0 ? (
					<EmptyState
						icon={Gift}
						title={t(`list.empty${TAB_KEY[tab]}`)}
						description={t(`list.empty${TAB_KEY[tab]}Body`)}
					/>
				) : (
					<div className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-4">
						{visible.map((giveaway) => (
							<GiveawayCard
								key={giveaway.id}
								giveaway={giveaway}
								roles={roles}
								busy={busyId === giveaway.id}
								when={relativeTime(giveaway.endedAt ?? giveaway.endsAt, rightNow)}
								onEnd={() => {
									act(
										giveaway,
										async () => endGiveaway(guildId, giveaway.id),
										t('card.didEnd', { prize: giveaway.prize })
									);
								}}
								onReroll={() => {
									act(
										giveaway,
										async () => rerollGiveaway(guildId, giveaway.id),
										t('card.didReroll', { prize: giveaway.prize })
									);
								}}
								onRemove={() => {
									setBusyId(giveaway.id);

									void removeGiveaway(guildId, giveaway.id)
										.then((result) => {
											if (result.status === 'error') {
												toast.error(result.message);
												return;
											}

											setRows((current) => current.filter((entry) => entry.id !== giveaway.id));
											toast.success(t('card.didRemove', { prize: giveaway.prize }));
										})
										.finally(() => {
											setBusyId(null);
										});
								}}
							/>
						))}
					</div>
				)}
			</SettingsSection>

			<SettingsSection title={t('defaults.title')} description={t('defaults.description')}>
				<Field label={t('defaults.winners')} className="w-32">
					<NumberInput
						min={1}
						max={MAX_WINNERS}
						value={draft.defaultWinners}
						onValueChange={(next) => {
							form.set('defaultWinners', next);
						}}
					/>
				</Field>

				<Switch
					checked={draft.dmWinners}
					onCheckedChange={(next) => {
						form.set('dmWinners', next);
					}}
					label={t('defaults.dm')}
					description={t('defaults.dmHint')}
				/>
			</SettingsSection>

			{creating ? (
				<NewGiveawayDialog
					channels={channels}
					roles={roles}
					defaultWinners={draft.defaultWinners}
					onCancel={() => {
						setCreating(false);
					}}
					onCreate={(started) => {
						setRows((current) => [started, ...current]);
						setCreating(false);
						setTab('active');
					}}
					guildId={guildId}
				/>
			) : null}
		</ModulePage>
	);
}

type GiveawayCardProps = {
	giveaway: Giveaway;
	roles: Role[];
	busy: boolean;
	when: string;
	onEnd: () => void;
	onReroll: () => void;
	onRemove: () => void;
};

function GiveawayCard({
	giveaway,
	roles,
	busy,
	when,
	onEnd,
	onReroll,
	onRemove
}: GiveawayCardProps) {
	const t = useTranslations('modules.giveaways.card');
	const required = roles.filter((role) => giveaway.requiredRoleIds.includes(role.id));

	return (
		<div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 shadow-1">
			<div className="flex items-start gap-3">
				<div className="min-w-0 flex-1">
					<h3 className="truncate text-h4">{giveaway.prize}</h3>
					<p className="text-caption font-normal text-text-muted">
						{t('winners', { count: giveaway.winners })}
					</p>
				</div>

				{giveaway.state === 'active' ? (
					<Badge variant="success" dot>
						{when}
					</Badge>
				) : (
					<Badge variant="neutral">{t('ended')}</Badge>
				)}
			</div>

			<div className="flex items-center gap-2">
				<Avatar
					initials={giveaway.hostInitials}
					color={giveaway.hostColor}
					shape="circle"
					size="sm"
				/>
				<span className="text-body-sm text-text-muted">
					{t('hostedBy', { host: giveaway.hostName })}
				</span>
				<div className="flex-1" />
				<span className="tabular text-body-sm font-medium">
					{t('entries', { count: formatCount(giveaway.entries) })}
				</span>
			</div>

			{required.length > 0 || giveaway.requiredLevel > 0 ? (
				<div className="flex flex-wrap gap-1.5">
					{required.map((role) => (
						<Badge key={role.id} variant="outline">
							<span
								aria-hidden="true"
								className="size-2 shrink-0 rounded-full"
								style={{ backgroundColor: role.color }}
							/>
							{role.name}
						</Badge>
					))}
					{giveaway.requiredLevel > 0 ? (
						<Badge variant="outline">{t('level', { level: giveaway.requiredLevel })}</Badge>
					) : null}
				</div>
			) : null}

			{giveaway.wonBy.length > 0 ? (
				<p className="text-body-sm text-text-muted">
					{t('wonBy')} <span className="font-medium text-text">{giveaway.wonBy.join(', ')}</span>
				</p>
			) : null}

			<div className="mt-auto flex items-center gap-2 pt-1">
				{giveaway.state === 'active' ? (
					<Button variant="outline" size="sm" disabled={busy} onClick={onEnd}>
						<CircleStop aria-hidden="true" />
						{t('endNow')}
					</Button>
				) : (
					<Button variant="outline" size="sm" disabled={busy} onClick={onReroll}>
						<Dices aria-hidden="true" />
						{t('reroll')}
					</Button>
				)}
				<Button
					variant="ghost-danger"
					size="sm"
					disabled={busy}
					onClick={onRemove}
					aria-label={t('remove')}
				>
					<Trash2 aria-hidden="true" />
				</Button>
			</div>
		</div>
	);
}

type NewGiveawayDialogProps = {
	guildId: string;
	channels: Channel[];
	roles: Role[];
	defaultWinners: number;
	onCancel: () => void;
	onCreate: (giveaway: Giveaway) => void;
};

function NewGiveawayDialog({
	guildId,
	channels,
	roles,
	defaultWinners,
	onCancel,
	onCreate
}: NewGiveawayDialogProps) {
	const t = useTranslations('modules.giveaways.create');
	const shared = useTranslations('common');
	const [channelId, setChannelId] = useState<string | null>(null);
	const [prize, setPrize] = useState('');
	const [description, setDescription] = useState('');
	const [winners, setWinners] = useState(defaultWinners);
	const [hours, setHours] = useState(24);
	const [requiredRoleIds, setRequiredRoleIds] = useState<string[]>([]);
	const [requiredLevel, setRequiredLevel] = useState(0);
	const [saving, setSaving] = useState(false);

	const payload = toStartPayload({
		channelId,
		prize,
		description,
		winners,
		hours,
		requiredRoleIds,
		requiredLevel
	});

	return (
		<Dialog
			open
			onOpenChange={(next) => {
				if (!next) onCancel();
			}}
			title={t('title')}
			description={t('description')}
			size="md"
			footer={
				<>
					<Button variant="ghost" onClick={onCancel}>
						{shared('cancel')}
					</Button>
					<Button
						disabled={payload === null || saving}
						onClick={() => {
							if (payload === null) return;

							setSaving(true);

							void startGiveaway(guildId, payload)
								.then((result) => {
									if (result.status === 'error') {
										toast.error(result.message);
										return;
									}

									onCreate(toGiveaway(result.giveaway));
									toast.success(t('started', { prize: result.giveaway.prize }));
								})
								.finally(() => {
									setSaving(false);
								});
						}}
					>
						{t('submit')}
					</Button>
				</>
			}
		>
			<div className="flex flex-col gap-5">
				<Field label={t('prize')} required>
					<Input
						value={prize}
						maxLength={MAX_PRIZE_LENGTH}
						onChange={(event) => {
							setPrize(event.target.value);
						}}
						placeholder={t('prizePlaceholder')}
					/>
				</Field>

				<Field label={t('channel')} required hint={t('channelHint')}>
					<ChannelPicker
						channels={channels}
						kinds={GIVEAWAY_CHANNEL_KINDS}
						value={channelId}
						onValueChange={setChannelId}
					/>
				</Field>

				<Field label={t('detail')} hint={t('detailHint')}>
					<Textarea
						value={description}
						maxLength={MAX_GIVEAWAY_DESCRIPTION_LENGTH}
						rows={2}
						onChange={(event) => {
							setDescription(event.target.value);
						}}
					/>
				</Field>

				<div className="flex flex-wrap items-end gap-4">
					<Field label={t('winners')} className="w-32">
						<NumberInput min={1} max={MAX_WINNERS} value={winners} onValueChange={setWinners} />
					</Field>
					<Field label={t('hours')} className="w-40">
						<NumberInput min={1} max={MAX_GIVEAWAY_HOURS} value={hours} onValueChange={setHours} />
					</Field>
				</div>

				<Field label={t('roles')} hint={t('rolesHint')}>
					<RolePicker
						roles={roles}
						value={requiredRoleIds}
						onValueChange={(next) => {
							setRequiredRoleIds(next.slice(0, MAX_REQUIRED_ROLES));
						}}
						placeholder={t('rolesPlaceholder')}
					/>
				</Field>

				<Field label={t('level')} hint={t('levelHint')} className="w-32">
					<NumberInput
						min={0}
						max={MAX_REQUIRED_LEVEL}
						value={requiredLevel}
						onValueChange={setRequiredLevel}
					/>
				</Field>
			</div>
		</Dialog>
	);
}
