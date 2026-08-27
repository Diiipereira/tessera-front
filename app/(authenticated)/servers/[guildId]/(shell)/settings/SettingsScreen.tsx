'use client';

import { Download, RotateCcw, Trash2, Upload } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/management/ConfirmDialog';
import { PageHeader } from '@/components/management/PageHeader';
import { SaveBar } from '@/components/modules/SaveBar';
import { SettingsSection } from '@/components/modules/SettingsSection';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { BRAND } from '@/lib/brand';
import { EMBED_SWATCHES } from '@/lib/discord-colors';
import { useConfigDraft } from '@/lib/hooks/useConfigDraft';
import { ROLE_LABELS, ROLE_ORDER } from '@/lib/team';
import type { GuildSettings, TeamMember } from '@/lib/types/management';

const LOCALES = [
	{ value: 'en-US', label: 'English (US)' },
	{ value: 'pt-BR', label: 'Português (Brasil)' },
	{ value: 'es-ES', label: 'Español' },
	{ value: 'fr-FR', label: 'Français' }
];

const TIMEZONES = [
	{ value: 'America/Sao_Paulo', label: 'America/São Paulo (GMT-3)' },
	{ value: 'UTC', label: 'UTC' },
	{ value: 'Europe/Lisbon', label: 'Europe/Lisbon (GMT+0)' },
	{ value: 'America/New_York', label: 'America/New York (GMT-5)' }
];

type Danger = 'reset' | 'remove' | null;

type SettingsScreenProps = {
	settings: GuildSettings;
	guildName: string;
	team: TeamMember[];
};

export function SettingsScreen({ settings, guildName, team }: SettingsScreenProps) {
	const form = useConfigDraft<GuildSettings>(settings);
	const draft = form.draft;
	const [danger, setDanger] = useState<Danger>(null);

	const seats = ROLE_ORDER.map((role) => ({
		role,
		count: team.filter((member) => member.role === role).length
	})).filter((seat) => seat.count > 0);

	return (
		<div className="w-full p-6 sm:p-8">
			<PageHeader
				title="Settings"
				description={`How ${BRAND.name} behaves in ${guildName}, and the things you can only do once.`}
			/>

			<div className="mt-6 flex flex-col gap-6">
				<SettingsSection
					title="Language and time"
					description="Everything the bot writes, and every schedule, follows these."
				>
					<Field
						label="Server language"
						hint="Bot replies use this, not each member's Discord locale."
					>
						<Select
							options={LOCALES}
							value={draft.locale}
							onValueChange={(next) => {
								form.set('locale', next);
							}}
							className="max-w-80"
						/>
					</Field>

					<Field
						label="Timezone"
						hint="Scheduled messages and daily resets run against this clock."
					>
						<Select
							options={TIMEZONES}
							value={draft.timezone}
							onValueChange={(next) => {
								form.set('timezone', next);
							}}
							className="max-w-80"
						/>
					</Field>
				</SettingsSection>

				<SettingsSection
					title="Appearance"
					description="How the bot shows up in the member list and in its own embeds."
				>
					<div className="flex flex-col gap-2">
						<span className="text-body-sm font-medium">Default embed colour</span>
						<div className="flex flex-wrap items-center gap-2">
							{EMBED_SWATCHES.map((color) => (
								<button
									key={color}
									type="button"
									aria-label={`Use ${color}`}
									aria-pressed={draft.embedColor.toLowerCase() === color}
									onClick={() => {
										form.set('embedColor', color);
									}}
									className={
										draft.embedColor.toLowerCase() === color
											? 'size-8 rounded-md ring-2 ring-primary ring-offset-2 ring-offset-surface'
											: 'size-8 rounded-md ring-1 ring-border'
									}
									style={{ backgroundColor: color }}
								/>
							))}
							<Input
								value={draft.embedColor}
								onChange={(event) => {
									form.set('embedColor', event.target.value);
								}}
								aria-label="Embed colour hex"
								className="w-28 font-mono"
								maxLength={7}
							/>
						</div>
					</div>

					<Field
						label="Bot nickname"
						hint={`Empty keeps ${BRAND.name}. Members see this name in the sidebar.`}
					>
						<Input
							value={draft.botNickname}
							onChange={(event) => {
								form.set('botNickname', event.target.value);
							}}
							placeholder={BRAND.name}
							className="max-w-80"
						/>
					</Field>

					<Field
						label="Legacy prefix"
						hint="For the handful of text commands that predate slash commands."
					>
						<Input
							value={draft.legacyPrefix}
							onChange={(event) => {
								form.set('legacyPrefix', event.target.value);
							}}
							maxLength={3}
							className="w-20 font-mono"
						/>
					</Field>
				</SettingsSection>

				<SettingsSection title="Replies" description="What the bot does after it answers.">
					<Switch
						checked={draft.deleteCommandReplies}
						onCheckedChange={(next) => {
							form.set('deleteCommandReplies', next);
						}}
						label="Clean up command replies"
						description="Deletes the bot answer after 30 seconds. Ephemeral replies are unaffected."
					/>

					<Switch
						checked={draft.dmOnFailure}
						onCheckedChange={(next) => {
							form.set('dmOnFailure', next);
						}}
						label="DM the member when a command fails"
						description="Rather than posting the error in the channel where everyone reads it."
					/>
				</SettingsSection>

				<SettingsSection
					title="Who can use the dashboard"
					description="Change this on the Team screen."
				>
					<ul className="flex flex-wrap gap-x-6 gap-y-2">
						{seats.map((seat) => (
							<li key={seat.role} className="text-body-sm">
								<span className="tabular font-semibold">{seat.count}</span>{' '}
								<span className="text-text-muted">
									{ROLE_LABELS[seat.role]}
									{seat.count === 1 ? '' : 's'}
								</span>
							</li>
						))}
					</ul>
					<p className="text-caption font-normal text-text-muted">
						Plus anyone holding Manage Server in Discord, which {BRAND.name} cannot revoke.
					</p>
				</SettingsSection>

				<SettingsSection
					title="Backup and restore"
					description="A copy of every module setting in this server, and a way to put one back."
				>
					<ActionRow
						title="Export configuration"
						body="A JSON file with every module setting in this server. Safe to keep, safe to share with support."
						action={
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									toast.success('Export ready', {
										description: 'The download starts once the API can produce the file.'
									});
								}}
							>
								<Download aria-hidden="true" />
								Export
							</Button>
						}
					/>

					<ActionRow
						title="Import configuration"
						body="Replaces every module setting with the file contents. You see a diff before anything is written."
						action={
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									toast.info('Pick a file to see the diff', {
										description: 'Nothing is written until you approve the changes.'
									});
								}}
							>
								<Upload aria-hidden="true" />
								Import
							</Button>
						}
					/>
				</SettingsSection>

				<SettingsSection
					title="Danger zone"
					description="These are not covered by the save bar — they apply the moment you confirm."
					danger
				>
					<ActionRow
						title="Reset all settings"
						body="Every module goes back to its defaults. Cases, audit history and member data are kept."
						action={
							<Button
								variant="danger"
								size="sm"
								onClick={() => {
									setDanger('reset');
								}}
							>
								<RotateCcw aria-hidden="true" />
								Reset
							</Button>
						}
					/>

					<ActionRow
						title={`Remove ${BRAND.name} from ${guildName}`}
						body="The bot leaves the server. Your configuration is kept for 30 days in case you invite it back."
						action={
							<Button
								variant="danger"
								size="sm"
								onClick={() => {
									setDanger('remove');
								}}
							>
								<Trash2 aria-hidden="true" />
								Remove bot
							</Button>
						}
					/>
				</SettingsSection>
			</div>

			<SaveBar
				dirty={form.dirty}
				changedCount={form.changedCount}
				state={form.state}
				onDiscard={form.discard}
				onSave={() => {
					void form.save().then(() => {
						toast.success('Settings saved');
					});
				}}
				onResolveConflict={form.resolveConflict}
			/>

			<ConfirmDialog
				open={danger === 'reset'}
				onOpenChange={(open) => {
					if (!open) setDanger(null);
				}}
				title="Reset every module?"
				description="Eleven modules go back to their defaults. This cannot be undone from here."
				confirmPhrase="RESET"
				confirmLabel="Reset everything"
				onConfirm={() => {
					toast.success('Settings reset', { description: 'Every module is back to its default.' });
				}}
			>
				<p className="text-body-sm text-text-muted">
					Your welcome message, AutoMod rules, ticket panels, shop items and scheduled messages are
					all deleted. Cases and the audit log survive.
				</p>
			</ConfirmDialog>

			<ConfirmDialog
				open={danger === 'remove'}
				onOpenChange={(open) => {
					if (!open) setDanger(null);
				}}
				title={`Remove ${BRAND.name} from ${guildName}?`}
				description="The bot leaves immediately. Nothing it was running keeps running."
				confirmPhrase={guildName}
				confirmLabel="Remove the bot"
				onConfirm={() => {
					toast.success(`${BRAND.name} left ${guildName}`, {
						description: 'Your configuration is kept for 30 days.'
					});
				}}
			>
				<p className="text-body-sm text-text-muted">
					Open tickets stay as channels but stop being managed. Active giveaways never draw a
					winner. Scheduled messages stop.
				</p>
			</ConfirmDialog>
		</div>
	);
}

function ActionRow({ title, body, action }: { title: string; body: string; action: ReactNode }) {
	return (
		<div className="flex flex-wrap items-start gap-3 border-b border-border pb-4 last:border-0 last:pb-0">
			<div className="min-w-60 flex-1">
				<p className="text-body font-medium">{title}</p>
				<p className="text-body-sm text-pretty text-text-muted">{body}</p>
			</div>
			<div className="shrink-0">{action}</div>
		</div>
	);
}
