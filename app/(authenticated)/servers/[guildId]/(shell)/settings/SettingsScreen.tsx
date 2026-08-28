'use client';

import { Download, RotateCcw, Trash2, Upload } from 'lucide-react';
import { useCallback, useMemo, type ReactNode } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/management/PageHeader';
import { SaveBar } from '@/components/modules/SaveBar';
import { SettingsSection } from '@/components/modules/SettingsSection';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Combobox } from '@/components/ui/Combobox';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { BRAND } from '@/lib/brand';
import { EMBED_SWATCHES } from '@/lib/discord-colors';
import { useConfigDraft, type SaveOutcome } from '@/lib/hooks/useConfigDraft';
import { patchSettings } from '@/lib/settings-client';
import { timezoneOptions } from '@/lib/timezones';
import type { GuildSettings } from '@/lib/types/management';

const LOCALES = [
	{ value: 'en-US', label: 'English (US)' },
	{ value: 'pt-BR', label: 'Português (Brasil)' }
];

type SettingsScreenProps = {
	guildId: string;
	settings: GuildSettings;
	guildName: string;
};

export function SettingsScreen({ guildId, settings, guildName }: SettingsScreenProps) {
	const save = useCallback(
		async (next: GuildSettings): Promise<SaveOutcome<GuildSettings>> => {
			const result = await patchSettings(guildId, next);

			return result.status === 'saved'
				? { status: 'saved', saved: result.settings }
				: { status: 'error', message: result.message };
		},
		[guildId]
	);

	const form = useConfigDraft<GuildSettings>(settings, { save });
	const draft = form.draft;
	const timezones = useMemo(() => timezoneOptions(), []);

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
					<div className="grid gap-4 sm:grid-cols-2">
						<Field
							label="Server language"
							hint="What the bot writes in Discord. Your dashboard language lives in your account."
						>
							<Select
								options={LOCALES}
								value={draft.locale}
								onValueChange={(next) => {
									form.set('locale', next);
								}}
							/>
						</Field>

						<Field
							label="Timezone"
							hint="Scheduled messages and daily resets run against this clock."
						>
							<Combobox
								options={timezones}
								value={draft.timezone}
								onValueChange={(next) => {
									form.set('timezone', next);
								}}
								placeholder="Pick a timezone"
								searchPlaceholder="Search timezones"
								emptyLabel="No timezone matches that."
							/>
						</Field>
					</div>
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
				</SettingsSection>

				<SettingsSection
					title="Backup and restore"
					description="A copy of every module setting in this server, and a way to put one back."
				>
					<ActionRow
						pending
						title="Export configuration"
						body="A JSON file with every module setting in this server. Safe to keep, safe to share with support."
						action={
							<Button variant="outline" size="sm" disabled>
								<Download aria-hidden="true" />
								Export
							</Button>
						}
					/>

					<ActionRow
						pending
						title="Import configuration"
						body="Replaces every module setting with the file contents. You see a diff before anything is written."
						action={
							<Button variant="outline" size="sm" disabled>
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
						pending
						title="Reset all settings"
						body="Every module goes back to its defaults. Cases, audit history and member data are kept."
						action={
							<Button variant="danger" size="sm" disabled>
								<RotateCcw aria-hidden="true" />
								Reset
							</Button>
						}
					/>

					<ActionRow
						pending
						title={`Remove ${BRAND.name} from ${guildName}`}
						body="The bot leaves the server. Your configuration is kept for 30 days in case you invite it back."
						action={
							<Button variant="danger" size="sm" disabled>
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
					void form.save().then(
						(state) => {
							if (state === 'idle') toast.success('Settings saved');
						},
						(error: unknown) => {
							toast.error('Could not save', {
								description: error instanceof Error ? error.message : 'Unknown failure'
							});
						}
					);
				}}
				onResolveConflict={form.resolveConflict}
			/>
		</div>
	);
}

function ActionRow({
	title,
	body,
	action,
	pending = false
}: {
	title: string;
	body: string;
	action: ReactNode;
	pending?: boolean;
}) {
	return (
		<div className="flex flex-wrap items-start gap-3 border-b border-border pb-4 last:border-0 last:pb-0">
			<div className="min-w-60 flex-1">
				<div className="flex flex-wrap items-center gap-2">
					<p className="text-body font-medium">{title}</p>
					{pending ? <Badge variant="neutral">Not available yet</Badge> : null}
				</div>
				<p className="text-body-sm text-pretty text-text-muted">{body}</p>
			</div>
			<div className="shrink-0">{action}</div>
		</div>
	);
}
