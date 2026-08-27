'use client';

import { Pencil, Plus, Terminal, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
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
import { commandNameError } from '@/lib/commands';
import { useConfigDraft } from '@/lib/hooks/useConfigDraft';
import type { Role } from '@/lib/types/discord';
import type { CustomCommand, CustomCommandsConfig } from '@/lib/types/module-configs';
import type { MessageVariable } from '@/lib/types/modules';
import { EMBED_SWATCHES } from '@/lib/discord-colors';
import { cn } from '@/lib/utils/cn';
import { newId } from '@/lib/utils/id';
import { formatCount } from '@/lib/utils/format';

function blankCommand(): CustomCommand {
	return {
		id: newId('cc'),
		name: '',
		description: '',
		uses: 0,
		ephemeral: false,
		enabled: true,
		requiredRoleIds: [],
		response: {
			mode: 'text',
			text: '',
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

type CustomCommandsScreenProps = {
	config: CustomCommandsConfig;
	roles: Role[];
	variables: MessageVariable[];
};

export function CustomCommandsScreen({ config, roles, variables }: CustomCommandsScreenProps) {
	const form = useConfigDraft<CustomCommandsConfig>(config);
	const draft = form.draft;

	const [selectedId, setSelectedId] = useState<string | null>(null);
	const selected = draft.commands.find((command) => command.id === selectedId) ?? null;

	function update(id: string, patch: Partial<CustomCommand>) {
		form.set(
			'commands',
			draft.commands.map((command) => (command.id === id ? { ...command, ...patch } : command))
		);
	}

	const nameError = selected
		? commandNameError(
				selected.name,
				draft.commands.filter((entry) => entry.id !== selected.id).map((entry) => entry.name)
			)
		: undefined;

	const aside = selected ? (
		<section
			aria-label="Response preview"
			className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-1"
		>
			<h2 className="text-h4">Preview</h2>
			<div className="rounded-md border border-border bg-surface-sunken px-3 py-2">
				<code className="font-mono text-body-sm text-primary">
					/{selected.name === '' ? 'name' : selected.name}
				</code>
			</div>
			<DiscordPreview message={selected.response} variables={variables} />
			{selected.ephemeral ? (
				<p className="text-caption font-normal text-text-muted">
					Only the person who ran it will see this.
				</p>
			) : null}
		</section>
	) : undefined;

	return (
		<ModulePage
			moduleId="custom-commands"
			icon={Terminal}
			title="Custom commands"
			description="Your own slash commands, with no code and no hosting."
			enabled={draft.enabled}
			onEnabledChange={(next) => {
				form.set('enabled', next);
			}}
			headerAction={
				<Button
					variant="outline"
					size="sm"
					onClick={() => {
						const command = blankCommand();
						form.set('commands', [...draft.commands, command]);
						setSelectedId(command.id);
					}}
				>
					<Plus aria-hidden="true" />
					New command
				</Button>
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
							toast.success('Commands saved');
						});
					}}
					onResolveConflict={form.resolveConflict}
				/>
			}
		>
			<SettingsSection
				title="Commands"
				description="Registered with Discord on save. New names can take a minute to appear."
			>
				{draft.commands.length === 0 ? (
					<p className="text-body-sm text-text-muted">No commands yet.</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full min-w-160 border-collapse">
							<thead>
								<tr className="border-b border-border text-left">
									{['Command', 'Description', 'Uses', 'On', ''].map((head, index) => (
										<th
											key={head + String(index)}
											className="pb-2 font-mono text-overline font-semibold text-text-muted uppercase"
										>
											{head === '' ? <span className="sr-only">Actions</span> : head}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{draft.commands.map((command) => (
									<tr key={command.id} className="border-b border-border last:border-0">
										<td className="py-3 pr-3">
											<button
												type="button"
												onClick={() => {
													setSelectedId(command.id);
												}}
												className={cn(
													'font-mono text-body-sm hover:underline',
													command.id === selectedId ? 'text-primary' : 'text-link'
												)}
											>
												/{command.name === '' ? 'untitled' : command.name}
											</button>
										</td>
										<td className="py-3 pr-3 text-body-sm text-text-muted">
											{command.description}
										</td>
										<td className="tabular py-3 pr-3 text-body-sm text-text-muted">
											{formatCount(command.uses)}
										</td>
										<td className="py-3 pr-3">
											<Switch
												checked={command.enabled}
												aria-label={`Enable ${command.name}`}
												onCheckedChange={(next) => {
													update(command.id, { enabled: next });
												}}
											/>
										</td>
										<td className="py-3">
											<div className="flex items-center justify-end gap-1">
												<Button
													variant="ghost"
													size="sm"
													iconOnly
													aria-label={`Edit /${command.name === '' ? 'untitled' : command.name}`}
													onClick={() => {
														setSelectedId(command.id);
													}}
												>
													<Pencil aria-hidden="true" />
												</Button>
												<Button
													variant="ghost-danger"
													size="sm"
													iconOnly
													aria-label={`Delete /${command.name === '' ? 'untitled' : command.name}`}
													onClick={() => {
														form.set(
															'commands',
															draft.commands.filter((entry) => entry.id !== command.id)
														);
														if (selectedId === command.id) setSelectedId(null);
													}}
												>
													<Trash2 aria-hidden="true" />
												</Button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</SettingsSection>

			{selected ? (
				<>
					<SettingsSection title="Command settings">
						<Field
							label="Name"
							hint="What members type after the slash."
							error={nameError}
							required
						>
							<Input
								value={selected.name}
								onChange={(event) => {
									update(selected.id, { name: event.target.value.toLowerCase() });
								}}
								maxLength={32}
								className="font-mono"
								placeholder="rules"
							/>
						</Field>

						<Field label="Description" hint="Shown in the Discord command list.">
							<Input
								value={selected.description}
								onChange={(event) => {
									update(selected.id, { description: event.target.value });
								}}
								maxLength={100}
								placeholder="Post the server rules"
							/>
						</Field>

						<Field label="Who can use it" hint="Leave empty to allow everyone.">
							<RolePicker
								roles={roles}
								value={selected.requiredRoleIds}
								onValueChange={(next) => {
									update(selected.id, { requiredRoleIds: next });
								}}
								placeholder="Everyone…"
							/>
						</Field>

						<Switch
							checked={selected.ephemeral}
							onCheckedChange={(next) => {
								update(selected.id, { ephemeral: next });
							}}
							label="Only the caller sees the reply"
							description="Good for anything noisy or personal."
						/>
					</SettingsSection>

					<SettingsSection title="Response">
						<MessageComposer
							value={selected.response}
							onChange={(next) => {
								update(selected.id, { response: next });
							}}
							variables={variables}
						/>
					</SettingsSection>
				</>
			) : null}
		</ModulePage>
	);
}
