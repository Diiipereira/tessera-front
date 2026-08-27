'use client';

import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { useId, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { imageUrlHint } from '@/lib/embed-urls';
import { insertAtCursor, unknownVariables } from '@/lib/message-variables';
import type { EmbedField, MessageDraft, MessageMode, MessageVariable } from '@/lib/types/modules';
import { cn } from '@/lib/utils/cn';
import { newId } from '@/lib/utils/id';
import { VariableChips } from './VariableChips';

const MODES: { id: MessageMode; label: string }[] = [
	{ id: 'text', label: 'Plain text' },
	{ id: 'embed', label: 'Embed' }
];

const segment = 'h-7 rounded-sm px-3 text-caption transition-colors duration-120 ease-out';

const TEXT_LIMIT = 2000;
const DESCRIPTION_LIMIT = 4096;

type MessageComposerProps = {
	value: MessageDraft;
	onChange: (value: MessageDraft) => void;
	variables: MessageVariable[];
};

export function MessageComposer({ value, onChange, variables }: MessageComposerProps) {
	const uid = useId();
	const textRef = useRef<HTMLTextAreaElement>(null);
	const descriptionRef = useRef<HTMLTextAreaElement>(null);

	const activeRef = value.mode === 'text' ? textRef : descriptionRef;
	const activeText = value.mode === 'text' ? value.text : value.embed.description;

	function setEmbed(patch: Partial<MessageDraft['embed']>) {
		onChange({ ...value, embed: { ...value.embed, ...patch } });
	}

	function insert(token: string) {
		const element = activeRef.current;
		const start = element?.selectionStart ?? activeText.length;
		const end = element?.selectionEnd ?? activeText.length;
		const result = insertAtCursor(activeText, token, start, end);

		if (value.mode === 'text') onChange({ ...value, text: result.text });
		else setEmbed({ description: result.text });

		requestAnimationFrame(() => {
			element?.focus();
			element?.setSelectionRange(result.cursor, result.cursor);
		});
	}

	function updateField(id: string, patch: Partial<EmbedField>) {
		setEmbed({
			fields: value.embed.fields.map((field) => (field.id === id ? { ...field, ...patch } : field))
		});
	}

	function addField() {
		setEmbed({
			fields: [...value.embed.fields, { id: newId(uid), name: '', value: '', inline: false }]
		});
	}

	function removeField(id: string) {
		setEmbed({ fields: value.embed.fields.filter((field) => field.id !== id) });
	}

	const unknown = unknownVariables(activeText, variables);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center gap-3">
				<div
					role="group"
					aria-label="Message format"
					className="flex items-center gap-0.5 rounded-md border border-border bg-surface-sunken p-0.5"
				>
					{MODES.map((mode) => (
						<button
							key={mode.id}
							type="button"
							aria-pressed={value.mode === mode.id}
							className={cn(
								segment,
								value.mode === mode.id
									? 'bg-primary-subtle text-primary'
									: 'text-text-muted hover:text-text'
							)}
							onClick={() => {
								onChange({ ...value, mode: mode.id });
							}}
						>
							{mode.label}
						</button>
					))}
				</div>
				<div className="flex-1" />
			</div>

			<VariableChips variables={variables} onInsert={insert} />

			{value.mode === 'text' ? (
				<Textarea
					ref={textRef}
					value={value.text}
					onChange={(event) => {
						onChange({ ...value, text: event.target.value });
					}}
					maxLength={TEXT_LIMIT}
					showCount
					aria-label="Message text"
					placeholder="Say something to the new member…"
				/>
			) : (
				<div className="flex flex-col gap-5">
					<Field label="Author" hint="A small line above the title.">
						<Input
							value={value.embed.authorName}
							onChange={(event) => {
								setEmbed({ authorName: event.target.value });
							}}
							placeholder="Tessera"
						/>
					</Field>

					<Field label="Title">
						<Input
							value={value.embed.title}
							onChange={(event) => {
								setEmbed({ title: event.target.value });
							}}
							placeholder="Welcome to {server}"
						/>
					</Field>

					<Field label="Description">
						<Textarea
							ref={descriptionRef}
							value={value.embed.description}
							onChange={(event) => {
								setEmbed({ description: event.target.value });
							}}
							maxLength={DESCRIPTION_LIMIT}
							showCount
							placeholder="Glad you made it, {user}."
						/>
					</Field>

					<Field label="Accent color" hint="The bar down the left of the embed.">
						<div className="flex items-center gap-2">
							<input
								type="color"
								value={value.embed.color}
								onChange={(event) => {
									setEmbed({ color: event.target.value });
								}}
								aria-label="Accent color"
								className="size-9 shrink-0 cursor-pointer overflow-hidden rounded-md border border-border bg-surface p-1 transition-colors duration-120 ease-out hover:border-border-strong"
							/>
							<Input
								value={value.embed.color}
								onChange={(event) => {
									setEmbed({ color: event.target.value });
								}}
								aria-label="Accent color hex"
								className="max-w-32 font-mono"
							/>
						</div>
					</Field>

					<div className="flex flex-col gap-3">
						<div className="flex items-center gap-3">
							<span className="font-mono text-overline text-text-muted uppercase">Fields</span>
							<div className="h-px flex-1 bg-border" />
							<Button variant="outline" size="sm" onClick={addField}>
								<Plus aria-hidden="true" />
								Add field
							</Button>
						</div>

						{value.embed.fields.length === 0 ? (
							<p className="text-body-sm text-text-muted">
								No fields. An embed works fine without them.
							</p>
						) : (
							value.embed.fields.map((field) => (
								<div
									key={field.id}
									className="flex items-start gap-2 rounded-md border border-border bg-surface-sunken p-3"
								>
									<GripVertical
										className="mt-2 size-4 shrink-0 cursor-grab text-text-subtle"
										aria-hidden="true"
									/>
									<div className="flex min-w-0 flex-1 flex-col gap-2">
										<Input
											value={field.name}
											onChange={(event) => {
												updateField(field.id, { name: event.target.value });
											}}
											aria-label="Field name"
											placeholder="Field name"
										/>
										<Textarea
											value={field.value}
											onChange={(event) => {
												updateField(field.id, { value: event.target.value });
											}}
											aria-label="Field value"
											placeholder="Field value"
											className="min-h-16"
										/>
										<Switch
											checked={field.inline}
											onCheckedChange={(next) => {
												updateField(field.id, { inline: next });
											}}
											label="Inline"
										/>
									</div>
									<Button
										variant="ghost-danger"
										size="sm"
										iconOnly
										aria-label={`Remove field ${field.name || 'without a name'}`}
										onClick={() => {
											removeField(field.id);
										}}
									>
										<Trash2 aria-hidden="true" />
									</Button>
								</div>
							))
						)}
					</div>

					<Field
						label="Image"
						hint={imageUrlHint(value.embed.imageUrl) ?? 'A wide picture under the text.'}
					>
						<Input
							value={value.embed.imageUrl}
							onChange={(event) => {
								setEmbed({ imageUrl: event.target.value });
							}}
							placeholder="https://cdn.discordapp.com/…/banner.png"
						/>
					</Field>

					<Field
						label="Thumbnail"
						hint={imageUrlHint(value.embed.thumbnailUrl) ?? 'A small picture in the top right.'}
					>
						<Input
							value={value.embed.thumbnailUrl}
							onChange={(event) => {
								setEmbed({ thumbnailUrl: event.target.value });
							}}
							placeholder="https://cdn.discordapp.com/…/icon.png"
						/>
					</Field>

					<Field label="Footer">
						<Input
							value={value.embed.footerText}
							onChange={(event) => {
								setEmbed({ footerText: event.target.value });
							}}
							placeholder="Joined {date}"
						/>
					</Field>

					<Switch
						checked={value.embed.timestamp}
						onCheckedChange={(next) => {
							setEmbed({ timestamp: next });
						}}
						label="Show a timestamp"
						description="Discord renders it next to the footer."
					/>
				</div>
			)}

			{unknown.length > 0 ? (
				<p className="text-caption font-normal text-warning-fg">
					{unknown.join(', ')} {unknown.length === 1 ? 'is not a variable' : 'are not variables'} —{' '}
					{unknown.length === 1 ? 'it' : 'they'} will post as written.
				</p>
			) : null}
		</div>
	);
}
