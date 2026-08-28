'use client';

import { Medal, Plus, RotateCcw, Trash2, TrendingUp, TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { ChannelPicker } from '@/components/discord/ChannelPicker';
import { RolePicker } from '@/components/discord/RolePicker';
import { MessageComposer } from '@/components/modules/MessageComposer';
import { ModulePage } from '@/components/modules/ModulePage';
import { SaveBar } from '@/components/modules/SaveBar';
import { SettingsSection } from '@/components/modules/SettingsSection';
import { Avatar } from '@/components/layout/Avatar';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { NumberInput } from '@/components/ui/NumberInput';
import { Skeleton } from '@/components/ui/Skeleton';
import { Switch } from '@/components/ui/Switch';
import { effortToLevel, totalXpForLevel } from '@/lib/levels';
import { useConfigDraft } from '@/lib/hooks/useConfigDraft';
import type { Channel, Role } from '@/lib/types/discord';
import type { LeaderboardEntry, LevelsConfig, RoleReward } from '@/lib/types/module-configs';
import type { MessageVariable } from '@/lib/types/modules';
import { cn } from '@/lib/utils/cn';
import { newId } from '@/lib/utils/id';
import { formatCount } from '@/lib/utils/format';

const LevelCurveChart = dynamic(
	() => import('@/components/modules/LevelCurveChart').then((module) => module.LevelCurveChart),
	{ ssr: false, loading: () => <Skeleton className="h-40 w-full rounded-md" /> }
);

const REWARD_COLUMNS = ['level', 'role', 'replace', ''];

const MEDALS = ['text-warning', 'text-text-muted', 'text-text-muted'];

type LevelsScreenProps = {
	config: LevelsConfig;
	channels: Channel[];
	roles: Role[];
	variables: MessageVariable[];
	leaderboard: LeaderboardEntry[];
};

export function LevelsScreen({
	config,
	channels,
	roles,
	variables,
	leaderboard
}: LevelsScreenProps) {
	const t = useTranslations('modules.levels');
	const form = useConfigDraft<LevelsConfig>(config);
	const draft = form.draft;

	const invertedRange = draft.xpMin > draft.xpMax;

	function updateReward(id: string, patch: Partial<RoleReward>) {
		form.set(
			'rewards',
			draft.rewards.map((reward) => (reward.id === id ? { ...reward, ...patch } : reward))
		);
	}

	function effortLabel(level: number): string {
		const effort = effortToLevel(
			level,
			draft.curve,
			draft.xpMin,
			draft.xpMax,
			draft.cooldownSeconds
		);

		return t(`curve.${effort.unit}`, { amount: effort.amount });
	}

	const sortedRewards = [...draft.rewards].sort((a, b) => a.level - b.level);

	const aside = (
		<section
			aria-label={t('leaderboard.label')}
			className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-1"
		>
			<div>
				<h2 className="text-h4">{t('leaderboard.title')}</h2>
				<p className="text-caption font-normal text-text-muted">{t('leaderboard.body')}</p>
			</div>

			<ol className="flex flex-col">
				{leaderboard.map((entry) => (
					<li
						key={entry.rank}
						className="flex items-center gap-2.5 border-b border-border py-2 last:border-0"
					>
						{entry.rank <= 3 ? (
							<Medal
								className={cn('size-4 shrink-0', MEDALS[entry.rank - 1])}
								aria-label={t('leaderboard.rank', { rank: entry.rank })}
							/>
						) : (
							<span className="tabular w-4 shrink-0 text-center text-caption font-normal text-text-muted">
								{entry.rank}
							</span>
						)}
						<Avatar initials={entry.initials} color={entry.color} shape="circle" size="sm" />
						<span className="min-w-0 flex-1 truncate text-body-sm">{entry.name}</span>
						<span className="tabular shrink-0 text-caption font-normal text-text-muted">
							{t('leaderboard.level', { level: entry.level })}
						</span>
					</li>
				))}
			</ol>
		</section>
	);

	return (
		<ModulePage
			moduleId="levels"
			icon={TrendingUp}
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
			<SettingsSection title={t('xp.title')} description={t('xp.description')}>
				<div className="flex flex-wrap items-start gap-4">
					<Field label={t('xp.min')} className="w-32">
						<NumberInput
							min={0}
							max={500}
							value={draft.xpMin}
							onValueChange={(next) => {
								form.set('xpMin', next);
							}}
						/>
					</Field>
					<Field label={t('xp.max')} className="w-32">
						<NumberInput
							min={0}
							max={500}
							value={draft.xpMax}
							onValueChange={(next) => {
								form.set('xpMax', next);
							}}
						/>
					</Field>
					<Field label={t('xp.cooldown')} className="w-40">
						<NumberInput
							min={0}
							max={3600}
							value={draft.cooldownSeconds}
							onValueChange={(next) => {
								form.set('cooldownSeconds', next);
							}}
						/>
					</Field>
					<Field label={t('xp.voice')} help={t('xp.voiceHelp')} className="w-40">
						<NumberInput
							min={0}
							max={100}
							value={draft.voiceXpPerMinute}
							onValueChange={(next) => {
								form.set('voiceXpPerMinute', next);
							}}
						/>
					</Field>
				</div>

				{invertedRange ? (
					<p className="flex items-center gap-1.5 text-caption font-normal text-danger">
						<TriangleAlert className="size-3.5 shrink-0" aria-hidden="true" />
						{t('xp.inverted')}
					</p>
				) : null}
			</SettingsSection>

			<SettingsSection title={t('curve.title')} description={t('curve.description')}>
				<Field label={t('curve.difficulty')} hint={t('curve.difficultyHint')}>
					<NumberInput
						min={10}
						max={500}
						value={draft.curve}
						onValueChange={(next) => {
							form.set('curve', next);
						}}
						className="w-32"
					/>
				</Field>

				<LevelCurveChart curve={draft.curve} />

				<div className="grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-3">
					{[5, 20, 50].map((level) => (
						<div key={level} className="rounded-md border border-border bg-surface-sunken p-3">
							<p className="text-caption font-normal text-text-muted">
								{t('curve.level', { level })}
							</p>
							<p className="tabular text-body font-medium">
								{t('curve.xp', { xp: formatCount(totalXpForLevel(level, draft.curve)) })}
							</p>
							<p className="text-caption font-normal text-text-muted">{effortLabel(level)}</p>
						</div>
					))}
				</div>
			</SettingsSection>

			<SettingsSection title={t('announce.title')}>
				<Switch
					checked={draft.announce}
					onCheckedChange={(next) => {
						form.set('announce', next);
					}}
					label={t('announce.toggle')}
				/>

				{draft.announce ? (
					<>
						<Switch
							checked={draft.announceInPlace}
							onCheckedChange={(next) => {
								form.set('announceInPlace', next);
							}}
							label={t('announce.inPlace')}
							description={t('announce.inPlaceHint')}
						/>

						{draft.announceInPlace ? null : (
							<Field label={t('announce.channel')}>
								<ChannelPicker
									channels={channels}
									value={draft.announceChannelId}
									onValueChange={(next) => {
										form.set('announceChannelId', next);
									}}
								/>
							</Field>
						)}

						<MessageComposer
							value={draft.announceMessage}
							onChange={(next) => {
								form.set('announceMessage', next);
							}}
							variables={variables}
						/>
					</>
				) : null}
			</SettingsSection>

			<SettingsSection
				title={t('rewards.title')}
				description={t('rewards.description')}
				action={
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							const highest = sortedRewards.at(-1)?.level ?? 0;
							form.set('rewards', [
								...draft.rewards,
								{
									id: newId('rw'),
									level: highest + 5,
									roleId: null,
									removePrevious: false
								}
							]);
						}}
					>
						<Plus aria-hidden="true" />
						Add reward
					</Button>
				}
			>
				{sortedRewards.length === 0 ? (
					<p className="text-body-sm text-text-muted">{t('rewards.empty')}</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full min-w-140 border-collapse">
							<thead>
								<tr className="border-b border-border text-left">
									{REWARD_COLUMNS.map((head, index) => (
										<th
											key={head + String(index)}
											className="pb-2 font-mono text-overline font-semibold text-text-muted uppercase"
										>
											{head === '' ? (
												<span className="sr-only">{t('rewards.remove')}</span>
											) : (
												t(`rewards.${head}`)
											)}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{sortedRewards.map((reward) => (
									<tr key={reward.id} className="border-b border-border last:border-0">
										<td className="py-2 pr-3 align-top">
											<NumberInput
												min={1}
												max={999}
												value={reward.level}
												onValueChange={(next) => {
													updateReward(reward.id, { level: next });
												}}
												aria-label={t('rewards.levelLabel')}
												className="tabular w-20"
											/>
										</td>
										<td className="py-2 pr-3 align-top">
											<RolePicker
												roles={roles}
												value={reward.roleId === null ? [] : [reward.roleId]}
												onValueChange={(next) => {
													updateReward(reward.id, { roleId: next.at(-1) ?? null });
												}}
											/>
										</td>
										<td className="py-2 pr-3 align-top">
											<Switch
												checked={reward.removePrevious}
												aria-label={t('rewards.replaceLabel', { level: reward.level })}
												onCheckedChange={(next) => {
													updateReward(reward.id, { removePrevious: next });
												}}
											/>
										</td>
										<td className="py-2 align-top">
											<Button
												variant="ghost-danger"
												size="sm"
												iconOnly
												aria-label={t('rewards.removeLabel', { level: reward.level })}
												onClick={() => {
													form.set(
														'rewards',
														draft.rewards.filter((entry) => entry.id !== reward.id)
													);
												}}
											>
												<Trash2 aria-hidden="true" />
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</SettingsSection>

			<SettingsSection title={t('noXp.title')} description={t('noXp.description')}>
				<Field label={t('announce.channel')}>
					<ChannelPicker
						channels={channels}
						value={draft.noXpChannelIds[0] ?? null}
						onValueChange={(next) => {
							form.set('noXpChannelIds', [next]);
						}}
						placeholder={t('noXp.channelPlaceholder')}
					/>
				</Field>

				<Field label={t('noXp.roles')}>
					<RolePicker
						roles={roles}
						value={draft.noXpRoleIds}
						onValueChange={(next) => {
							form.set('noXpRoleIds', next);
						}}
						placeholder={t('noXp.rolesPlaceholder')}
					/>
				</Field>
			</SettingsSection>

			<SettingsSection title={t('danger.title')} description={t('danger.description')} danger>
				<div className="flex flex-wrap items-center gap-3">
					<Button
						variant="danger"
						onClick={() => {
							toast.error(t('danger.reset'), {
								description: t('danger.resetPending')
							});
						}}
					>
						<RotateCcw aria-hidden="true" />
						{t('danger.reset')}
					</Button>
					<p className="text-body-sm text-text-muted">{t('danger.resetBody')}</p>
				</div>
			</SettingsSection>
		</ModulePage>
	);
}
