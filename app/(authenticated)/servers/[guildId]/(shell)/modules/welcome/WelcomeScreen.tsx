'use client';

import { DoorOpen } from 'lucide-react';
import { useCallback, useRef } from 'react';
import { DiscordPreview } from '@/components/modules/DiscordPreview';
import { MessageComposer } from '@/components/modules/MessageComposer';
import { ModulePage } from '@/components/modules/ModulePage';
import { SaveBar } from '@/components/modules/SaveBar';
import { SettingsSection } from '@/components/modules/SettingsSection';
import { ChannelPicker } from '@/components/discord/ChannelPicker';
import { RolePicker } from '@/components/discord/RolePicker';
import { Field } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';
import { useConfigDraft, type SaveOutcome } from '@/lib/hooks/useConfigDraft';
import { patchModule } from '@/lib/module-client';
import {
	WELCOME_AUTO_ROLES_MAX,
	WELCOME_DELETE_AFTER_MAX,
	toWelcomeConfig,
	toWelcomePatch
} from '@/lib/modules/welcome';
import type { Channel, Role } from '@/lib/types/discord';
import type { MessageVariable, WelcomeConfig, WelcomePingMode } from '@/lib/types/modules';
import { toast } from 'sonner';

const PING_MODES: { value: WelcomePingMode; label: string; hint: string }[] = [
	{ value: 'none', label: 'Do not mention', hint: '{user} shows the display name.' },
	{ value: 'inline', label: 'Mention in the message', hint: '{user} becomes a real mention.' },
	{
		value: 'ghost',
		label: 'Ghost ping',
		hint: 'A separate mention is posted and deleted at once.'
	}
];

const DELETE_AFTER: { value: string; label: string }[] = [
	{ value: '0', label: 'Keep it' },
	{ value: '30', label: 'After 30 seconds' },
	{ value: '60', label: 'After 1 minute' },
	{ value: '300', label: 'After 5 minutes' },
	{ value: '3600', label: 'After 1 hour' },
	{ value: String(WELCOME_DELETE_AFTER_MAX), label: 'After 1 day' }
];

type WelcomeScreenProps = {
	guildId: string;
	config: WelcomeConfig;
	version: number;
	channels: Channel[];
	roles: Role[];
	variables: MessageVariable[];
};

export function WelcomeScreen({
	guildId,
	config,
	version,
	channels,
	roles,
	variables
}: WelcomeScreenProps) {
	const versionRef = useRef(version);

	const save = useCallback(
		async (next: WelcomeConfig): Promise<SaveOutcome<WelcomeConfig>> => {
			const result = await patchModule(guildId, 'welcome', {
				version: versionRef.current,
				enabled: next.enabled,
				config: toWelcomePatch(next)
			});

			if (result.status === 'error') return result;

			versionRef.current = result.state.version;

			return result.status === 'saved'
				? { status: 'saved', saved: toWelcomeConfig(result.state) }
				: { status: 'conflict', current: toWelcomeConfig(result.state) };
		},
		[guildId]
	);

	const form = useConfigDraft<WelcomeConfig>(config, { save });
	const draft = form.draft;

	const preview = (
		<section
			aria-label="Preview"
			className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-1"
		>
			<h2 className="min-w-0 truncate text-h4">Preview</h2>

			<DiscordPreview message={draft.message} variables={variables} />

			<p className="text-caption font-normal text-text-muted">
				Variables are shown with sample data. The real post uses the member who joined.
			</p>
		</section>
	);

	return (
		<ModulePage
			moduleId="welcome"
			icon={DoorOpen}
			title="Welcome"
			description="Greet new members and give them a role the moment they join."
			enabled={draft.enabled}
			onEnabledChange={(next) => {
				form.set('enabled', next);
			}}
			aside={preview}
			saveBar={
				<SaveBar
					dirty={form.dirty}
					changedCount={form.changedCount}
					state={form.state}
					onDiscard={form.discard}
					onSave={() => {
						void form.save().then(
							(state) => {
								if (state === 'idle') toast.success('Welcome settings saved');
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
			}
		>
			<SettingsSection
				title="Welcome message"
				description="Posted in a channel the moment someone joins."
			>
				<Field label="Channel" hint="Required before the module can be switched on.">
					<ChannelPicker
						channels={channels}
						value={draft.channelId}
						onValueChange={(next) => {
							form.set('channelId', next);
						}}
					/>
				</Field>

				<MessageComposer
					value={draft.message}
					onChange={(next) => {
						form.set('message', next);
					}}
					variables={variables}
				/>
			</SettingsSection>

			<SettingsSection
				title="Mention"
				description="How {user} is rendered when the greeting is posted."
			>
				<Field label="Ping mode" hint={PING_MODES.find((m) => m.value === draft.pingMode)?.hint}>
					<Select
						value={draft.pingMode}
						onValueChange={(next) => {
							form.set('pingMode', next as WelcomePingMode);
						}}
						options={PING_MODES.map((mode) => ({ value: mode.value, label: mode.label }))}
					/>
				</Field>
			</SettingsSection>

			<SettingsSection
				title="Autorole"
				description={`Given automatically on join. Up to ${String(WELCOME_AUTO_ROLES_MAX)} roles.`}
			>
				<Field label="Roles to assign">
					<RolePicker
						roles={roles}
						value={draft.autoRoleIds}
						onValueChange={(next) => {
							form.set('autoRoleIds', next.slice(0, WELCOME_AUTO_ROLES_MAX));
						}}
					/>
				</Field>
			</SettingsSection>

			<SettingsSection title="Cleanup" description="Keep the channel from filling up with joins.">
				<Field label="Delete the greeting">
					<Select
						value={String(draft.deleteAfter ?? 0)}
						onValueChange={(next) => {
							form.set('deleteAfter', Number(next) === 0 ? null : Number(next));
						}}
						options={DELETE_AFTER}
					/>
				</Field>
			</SettingsSection>
		</ModulePage>
	);
}
