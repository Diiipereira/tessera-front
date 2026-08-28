'use client';

import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { BRAND } from '@/lib/brand';
import { imageUrlIssue } from '@/lib/embed-urls';
import { insertAtCursor, unknownVariables } from '@/lib/message-variables';
import type { EmbedField, MessageDraft, MessageMode, MessageVariable } from '@/lib/types/modules';
import { cn } from '@/lib/utils/cn';
import { newId } from '@/lib/utils/id';
import { VariableChips } from './VariableChips';

const MODES: MessageMode[] = ['text', 'embed'];

const segment = 'h-7 rounded-sm px-3 text-caption transition-colors duration-120 ease-out';

const TEXT_LIMIT = 2000;
const DESCRIPTION_LIMIT = 4096;

type MessageComposerProps = {
	value: MessageDraft;
	onChange: (value: MessageDraft) => void;
	variables: MessageVariable[];
};

export function MessageComposer({ value, onChange, variables }: MessageComposerProps) {
	const t = useTranslations('modules.composer');
	const urls = useTranslations('modules.url');
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

	function hintFor(url: string, fallback: 'imageHint' | 'thumbnailHint') {
		const issue = imageUrlIssue(url);

		return issue === null ? t(fallback) : urls(issue);
	}

	const unknown = unknownVariables(activeText, variables);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center gap-3">
				<div
					role="group"
					aria-label={t('format')}
					className="flex items-center gap-0.5 rounded-md border border-border bg-surface-sunken p-0.5"
				>
					{MODES.map((mode) => (
						<button
							key={mode}
							type="button"
							aria-pressed={value.mode === mode}
							className={cn(
								segment,
								value.mode === mode
									? 'bg-primary-subtle text-primary'
									: 'text-text-muted hover:text-text'
							)}
							onClick={() => {
								onChange({ ...value, mode });
							}}
						>
							{t(mode)}
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
					aria-label={t('messageLabel')}
					placeholder={t('messagePlaceholder')}
				/>
			) : (
				<div className="flex flex-col gap-5">
					<Field label={t('author')} hint={t('authorHint')}>
						<Input
							value={value.embed.authorName}
							onChange={(event) => {
								setEmbed({ authorName: event.target.value });
							}}
							placeholder={BRAND.name}
						/>
					</Field>

					<Field label={t('title')}>
						<Input
							value={value.embed.title}
							onChange={(event) => {
								setEmbed({ title: event.target.value });
							}}
							placeholder={t('titlePlaceholder')}
						/>
					</Field>

					<Field label={t('description')}>
						<Textarea
							ref={descriptionRef}
							value={value.embed.description}
							onChange={(event) => {
								setEmbed({ description: event.target.value });
							}}
							maxLength={DESCRIPTION_LIMIT}
							showCount
							placeholder={t('descriptionPlaceholder')}
						/>
					</Field>

					<Field label={t('color')} hint={t('colorHint')}>
						<div className="flex items-center gap-2">
							<input
								type="color"
								value={value.embed.color}
								onChange={(event) => {
									setEmbed({ color: event.target.value });
								}}
								aria-label={t('color')}
								className="size-9 shrink-0 cursor-pointer overflow-hidden rounded-md border border-border bg-surface p-1 transition-colors duration-120 ease-out hover:border-border-strong"
							/>
							<Input
								value={value.embed.color}
								onChange={(event) => {
									setEmbed({ color: event.target.value });
								}}
								aria-label={t('colorHex')}
								className="max-w-32 font-mono"
							/>
						</div>
					</Field>

					<div className="flex flex-col gap-3">
						<div className="flex items-center gap-3">
							<span className="font-mono text-overline text-text-muted uppercase">
								{t('fields')}
							</span>
							<div className="h-px flex-1 bg-border" />
							<Button variant="outline" size="sm" onClick={addField}>
								<Plus aria-hidden="true" />
								{t('addField')}
							</Button>
						</div>

						{value.embed.fields.length === 0 ? (
							<p className="text-body-sm text-text-muted">{t('noFields')}</p>
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
											aria-label={t('fieldName')}
											placeholder={t('fieldName')}
										/>
										<Textarea
											value={field.value}
											onChange={(event) => {
												updateField(field.id, { value: event.target.value });
											}}
											aria-label={t('fieldValue')}
											placeholder={t('fieldValue')}
											className="min-h-16"
										/>
										<Switch
											checked={field.inline}
											onCheckedChange={(next) => {
												updateField(field.id, { inline: next });
											}}
											label={t('inline')}
										/>
									</div>
									<Button
										variant="ghost-danger"
										size="sm"
										iconOnly
										aria-label={t('removeField', {
											name: field.name === '' ? t('unnamedField') : field.name
										})}
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

					<Field label={t('image')} hint={hintFor(value.embed.imageUrl, 'imageHint')}>
						<Input
							value={value.embed.imageUrl}
							onChange={(event) => {
								setEmbed({ imageUrl: event.target.value });
							}}
							placeholder={t('imagePlaceholder')}
						/>
					</Field>

					<Field label={t('thumbnail')} hint={hintFor(value.embed.thumbnailUrl, 'thumbnailHint')}>
						<Input
							value={value.embed.thumbnailUrl}
							onChange={(event) => {
								setEmbed({ thumbnailUrl: event.target.value });
							}}
							placeholder={t('thumbnailPlaceholder')}
						/>
					</Field>

					<Field label={t('footer')}>
						<Input
							value={value.embed.footerText}
							onChange={(event) => {
								setEmbed({ footerText: event.target.value });
							}}
							placeholder={t('footerPlaceholder')}
						/>
					</Field>

					<Switch
						checked={value.embed.timestamp}
						onCheckedChange={(next) => {
							setEmbed({ timestamp: next });
						}}
						label={t('timestamp')}
						description={t('timestampHint')}
					/>
				</div>
			)}

			{unknown.length > 0 ? (
				<p className="text-caption font-normal text-warning-fg">
					{t('unknown', { list: unknown.join(', '), count: unknown.length })}
				</p>
			) : null}
		</div>
	);
}
