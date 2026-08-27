'use client';

import { Shield, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { RolePicker } from '@/components/discord/RolePicker';
import { EscalationTable } from '@/components/modules/EscalationTable';
import { ModulePage } from '@/components/modules/ModulePage';
import { SaveBar } from '@/components/modules/SaveBar';
import { SettingsSection } from '@/components/modules/SettingsSection';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { useConfigDraft } from '@/lib/hooks/useConfigDraft';
import type { Role } from '@/lib/types/discord';
import type { ModerationConfig } from '@/lib/types/modules';

const TIMEOUT_DURATIONS = [
	{ value: '60s', label: '60 seconds' },
	{ value: '5m', label: '5 minutes' },
	{ value: '1h', label: '1 hour' },
	{ value: '24h', label: '24 hours' },
	{ value: '7d', label: '7 days' }
];

const MUTE_DURATIONS = [
	{ value: '1h', label: '1 hour' },
	{ value: '24h', label: '24 hours' },
	{ value: '7d', label: '7 days' },
	{ value: 'permanent', label: 'Until lifted' }
];

const DELETE_DAYS = [
	{ value: '0', label: 'Keep their messages' },
	{ value: '1', label: 'Delete the last 24 hours' },
	{ value: '7', label: 'Delete the last 7 days' }
];

type ModerationScreenProps = {
	config: ModerationConfig;
	roles: Role[];
};

export function ModerationScreen({ config, roles }: ModerationScreenProps) {
	const form = useConfigDraft<ModerationConfig>(config);
	const draft = form.draft;

	const mutedRole = roles.find((role) => role.id === draft.mutedRoleId);

	return (
		<ModulePage
			moduleId="moderation"
			icon={Shield}
			title="Moderation"
			description="Warns, timeouts, mutes and bans — every one of them written to the case log."
			enabled={draft.enabled}
			onEnabledChange={(next) => {
				form.set('enabled', next);
			}}
			saveBar={
				<SaveBar
					dirty={form.dirty}
					changedCount={form.changedCount}
					state={form.state}
					onDiscard={form.discard}
					onSave={() => {
						void form.save().then(() => {
							toast.success('Moderation settings saved');
						});
					}}
					onResolveConflict={form.resolveConflict}
				/>
			}
		>
			<SettingsSection
				title="Who can moderate"
				description="These roles get the moderation commands and the dashboard actions."
			>
				<Field label="Moderator roles" hint="Roles above the bot's own role are locked.">
					<RolePicker
						roles={roles}
						value={draft.modRoleIds}
						onValueChange={(next) => {
							form.set('modRoleIds', next);
						}}
						placeholder="Pick the staff roles…"
					/>
				</Field>

				<Field
					label="Protected roles"
					hint="Members with these roles cannot be punished, even by a moderator."
				>
					<RolePicker
						roles={roles}
						value={draft.protectedRoleIds}
						onValueChange={(next) => {
							form.set('protectedRoleIds', next);
						}}
						placeholder="Nobody is protected…"
					/>
				</Field>
			</SettingsSection>

			<SettingsSection
				title="Muted role"
				description="Used by the mute command. Discord timeouts do not need one; a mute that outlives 28 days does."
			>
				{mutedRole ? (
					<Field label="Role">
						<RolePicker
							roles={roles}
							value={[mutedRole.id]}
							onValueChange={(next) => {
								form.set('mutedRoleId', next.at(-1) ?? null);
							}}
						/>
					</Field>
				) : (
					<Alert variant="warning" title="No muted role yet">
						Mute will fall back to a Discord timeout, which Discord caps at 28 days.
						<div className="mt-3">
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									const created = roles.find((role) => !role.lockedReason);
									if (!created) return;
									form.set('mutedRoleId', created.id);
									toast.success(`Using @${created.name} as the muted role`, {
										description: 'Creating a fresh role needs the API, so this reuses one for now.'
									});
								}}
							>
								<Wand2 aria-hidden="true" />
								Create it for me
							</Button>
						</div>
					</Alert>
				)}
			</SettingsSection>

			<SettingsSection
				title="Defaults"
				description="What a moderator gets when they run a command without a duration."
			>
				<Field label="Timeout">
					<Select
						options={TIMEOUT_DURATIONS}
						value={draft.timeoutDefault}
						onValueChange={(next) => {
							form.set('timeoutDefault', next);
						}}
					/>
				</Field>

				<Field label="Mute">
					<Select
						options={MUTE_DURATIONS}
						value={draft.muteDefault}
						onValueChange={(next) => {
							form.set('muteDefault', next);
						}}
					/>
				</Field>

				<Field label="On ban" hint="Discord can clear recent messages as part of the ban.">
					<Select
						options={DELETE_DAYS}
						value={draft.banDeleteDays}
						onValueChange={(next) => {
							form.set('banDeleteDays', next);
						}}
					/>
				</Field>

				<Switch
					checked={draft.reasonRequired}
					onCheckedChange={(next) => {
						form.set('reasonRequired', next);
					}}
					label="Require a reason"
					description="The command is refused without one. The case log is only useful if it is filled in."
				/>
			</SettingsSection>

			<SettingsSection
				title="Telling the member"
				description="Sent before the punishment lands, so a ban still reaches them."
			>
				<Switch
					checked={draft.dmOnPunish}
					onCheckedChange={(next) => {
						form.set('dmOnPunish', next);
					}}
					label="DM the member"
					description="Silently skipped if they have DMs from the server turned off."
				/>

				{draft.dmOnPunish ? (
					<>
						<Field
							label="Message"
							hint="{action}, {reason}, {duration} and {server} are filled in."
						>
							<Textarea
								value={draft.dmTemplate}
								onChange={(event) => {
									form.set('dmTemplate', event.target.value);
								}}
								maxLength={1000}
								showCount
							/>
						</Field>

						<Field label="Appeal link" help="Added to the bottom of the message when set.">
							<Input
								type="url"
								value={draft.appealUrl}
								onChange={(event) => {
									form.set('appealUrl', event.target.value);
								}}
								placeholder="https://"
							/>
						</Field>
					</>
				) : null}
			</SettingsSection>

			<SettingsSection
				title="Warning escalation"
				description="Run automatically once a member reaches a warning count."
			>
				<EscalationTable
					rules={draft.escalation}
					onChange={(next) => {
						form.set('escalation', next);
					}}
				/>
			</SettingsSection>
		</ModulePage>
	);
}
