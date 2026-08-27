'use client';

import { CircleStop, Dices, Gift, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
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
import { EMBED_SWATCHES } from '@/lib/discord-colors';
import { useConfigDraft } from '@/lib/hooks/useConfigDraft';
import type { Role } from '@/lib/types/discord';
import type { Giveaway, GiveawayState, GiveawaysConfig } from '@/lib/types/module-configs';
import { formatCountdown } from '@/lib/time';
import { formatCount } from '@/lib/utils/format';
import { newId } from '@/lib/utils/id';

type GiveawaysScreenProps = {
	config: GiveawaysConfig;
	roles: Role[];
};

export function GiveawaysScreen({ config, roles }: GiveawaysScreenProps) {
	const form = useConfigDraft<GiveawaysConfig>(config);
	const draft = form.draft;

	const [tab, setTab] = useState<GiveawayState>('active');
	const [creating, setCreating] = useState(false);

	const counts: Record<GiveawayState, number> = {
		active: draft.giveaways.filter((entry) => entry.state === 'active').length,
		scheduled: draft.giveaways.filter((entry) => entry.state === 'scheduled').length,
		ended: draft.giveaways.filter((entry) => entry.state === 'ended').length
	};

	const visible = draft.giveaways.filter((entry) => entry.state === tab);

	return (
		<ModulePage
			moduleId="giveaways"
			icon={Gift}
			title="Giveaways"
			description="Timed draws with entry requirements, and a reroll when a winner goes quiet."
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
					New giveaway
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
							toast.success('Giveaways saved');
						});
					}}
					onResolveConflict={form.resolveConflict}
				/>
			}
		>
			<SettingsSection
				title="Giveaways"
				action={
					<SegmentedControl
						options={[
							{ value: 'active', label: 'Active', count: counts.active },
							{ value: 'scheduled', label: 'Scheduled', count: counts.scheduled },
							{ value: 'ended', label: 'Ended', count: counts.ended }
						]}
						value={tab}
						onValueChange={setTab}
						label="Giveaway state"
						size="sm"
					/>
				}
			>
				{visible.length === 0 ? (
					<EmptyState
						icon={Gift}
						title={`Nothing ${tab}`}
						description={
							tab === 'active'
								? 'Start one and it shows up here with a live count.'
								: tab === 'scheduled'
									? 'Giveaways set to start later appear here.'
									: 'Finished giveaways and their winners land here.'
						}
					/>
				) : (
					<div className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-4">
						{visible.map((giveaway) => (
							<GiveawayCard
								key={giveaway.id}
								giveaway={giveaway}
								roles={roles}
								onEnd={() => {
									form.set(
										'giveaways',
										draft.giveaways.map((entry) =>
											entry.id === giveaway.id
												? { ...entry, state: 'ended', endsInSeconds: 0, wonBy: ['okra'] }
												: entry
										)
									);
									toast.success(`Ended "${giveaway.prize}"`);
								}}
								onReroll={() => {
									toast.success(`Rerolled "${giveaway.prize}"`, {
										description: 'A new winner is picked once the API exists.'
									});
								}}
							/>
						))}
					</div>
				)}
			</SettingsSection>

			<SettingsSection title="Defaults" description="Used when a new giveaway is created.">
				<Field label="Winners" className="w-32">
					<NumberInput
						min={1}
						max={50}
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
					label="DM the winners"
					description="They also get pinged in the channel either way."
				/>
			</SettingsSection>

			{creating ? (
				<NewGiveawayDialog
					roles={roles}
					defaultWinners={draft.defaultWinners}
					onCancel={() => {
						setCreating(false);
					}}
					onCreate={(giveaway) => {
						form.set('giveaways', [giveaway, ...draft.giveaways]);
						setCreating(false);
						setTab(giveaway.state);
					}}
				/>
			) : null}
		</ModulePage>
	);
}

type GiveawayCardProps = {
	giveaway: Giveaway;
	roles: Role[];
	onEnd: () => void;
	onReroll: () => void;
};

function GiveawayCard({ giveaway, roles, onEnd, onReroll }: GiveawayCardProps) {
	const required = roles.filter((role) => giveaway.requiredRoleIds.includes(role.id));

	return (
		<div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 shadow-1">
			<div className="flex items-start gap-3">
				<div className="min-w-0 flex-1">
					<h3 className="truncate text-h4">{giveaway.prize}</h3>
					<p className="text-caption font-normal text-text-muted">
						{giveaway.winners} {giveaway.winners === 1 ? 'winner' : 'winners'}
					</p>
				</div>

				{giveaway.state === 'active' ? (
					<Badge variant="success" dot>
						{formatCountdown(giveaway.endsInSeconds)}
					</Badge>
				) : giveaway.state === 'scheduled' ? (
					<Badge variant="info">{giveaway.startsIn}</Badge>
				) : (
					<Badge variant="neutral">ended</Badge>
				)}
			</div>

			<div className="flex items-center gap-2">
				<Avatar
					initials={giveaway.hostInitials}
					color={giveaway.hostColor}
					shape="circle"
					size="sm"
				/>
				<span className="text-body-sm text-text-muted">hosted by {giveaway.hostName}</span>
				<div className="flex-1" />
				<span className="tabular text-body-sm font-medium">
					{formatCount(giveaway.entries)} entries
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
						<Badge variant="outline">level {giveaway.requiredLevel}+</Badge>
					) : null}
				</div>
			) : null}

			{giveaway.wonBy.length > 0 ? (
				<p className="text-body-sm text-text-muted">
					Won by <span className="font-medium text-text">{giveaway.wonBy.join(', ')}</span>
				</p>
			) : null}

			<div className="mt-auto flex items-center gap-2 pt-1">
				{giveaway.state === 'active' ? (
					<Button variant="outline" size="sm" onClick={onEnd}>
						<CircleStop aria-hidden="true" />
						End now
					</Button>
				) : null}
				{giveaway.state === 'ended' ? (
					<Button variant="outline" size="sm" onClick={onReroll}>
						<Dices aria-hidden="true" />
						Reroll
					</Button>
				) : null}
			</div>
		</div>
	);
}

type NewGiveawayDialogProps = {
	roles: Role[];
	defaultWinners: number;
	onCancel: () => void;
	onCreate: (giveaway: Giveaway) => void;
};

function NewGiveawayDialog({ roles, defaultWinners, onCancel, onCreate }: NewGiveawayDialogProps) {
	const [prize, setPrize] = useState('');
	const [winners, setWinners] = useState(defaultWinners);
	const [hours, setHours] = useState(24);
	const [requiredRoleIds, setRequiredRoleIds] = useState<string[]>([]);
	const [requiredLevel, setRequiredLevel] = useState(0);

	return (
		<Dialog
			open
			onOpenChange={(next) => {
				if (!next) onCancel();
			}}
			title="New giveaway"
			description="It starts the moment you create it."
			size="md"
			footer={
				<>
					<Button variant="ghost" onClick={onCancel}>
						Cancel
					</Button>
					<Button
						disabled={prize.trim() === ''}
						onClick={() => {
							onCreate({
								id: newId('g'),
								prize: prize.trim(),
								winners,
								entries: 0,
								hostName: 'you',
								hostInitials: 'YO',
								hostColor: EMBED_SWATCHES[0],
								state: 'active',
								endsInSeconds: hours * 3600,
								startsIn: '',
								wonBy: [],
								requiredRoleIds,
								requiredLevel
							});
						}}
					>
						Start giveaway
					</Button>
				</>
			}
		>
			<div className="flex flex-col gap-5">
				<Field label="Prize" required>
					<Input
						value={prize}
						onChange={(event) => {
							setPrize(event.target.value);
						}}
						placeholder="Nitro for a month"
					/>
				</Field>

				<div className="flex flex-wrap items-end gap-4">
					<Field label="Winners" className="w-32">
						<NumberInput min={1} max={50} value={winners} onValueChange={setWinners} />
					</Field>
					<Field label="Runs for (hours)" className="w-40">
						<NumberInput min={1} max={720} value={hours} onValueChange={setHours} />
					</Field>
				</div>

				<Field label="Required roles" hint="Leave empty to let everyone enter.">
					<RolePicker
						roles={roles}
						value={requiredRoleIds}
						onValueChange={setRequiredRoleIds}
						placeholder="Anyone can enter…"
					/>
				</Field>

				<Field label="Minimum level" hint="0 means no level requirement." className="w-32">
					<NumberInput min={0} max={200} value={requiredLevel} onValueChange={setRequiredLevel} />
				</Field>
			</div>
		</Dialog>
	);
}
