'use client';

import { ClipboardCopy, ClipboardPaste } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { readEmbedJson, toDiscordEmbed } from '@/lib/embed-json';
import type { EmbedDraft } from '@/lib/types/modules';

type EmbedJsonToolsProps = {
	embed: EmbedDraft;
	defaultColor: string;
	onApply: (embed: EmbedDraft) => void;
};

export function EmbedJsonTools({ embed, defaultColor, onApply }: EmbedJsonToolsProps) {
	const t = useTranslations('embeds.json');
	const [text, setText] = useState('');

	async function copy(): Promise<void> {
		const json = JSON.stringify(toDiscordEmbed(embed), null, 2);

		setText(json);

		try {
			await navigator.clipboard.writeText(json);
			toast.success(t('copied'));
		} catch {
			toast.warning(t('copyRefused'));
		}
	}

	function apply(): void {
		const read = readEmbedJson(text, defaultColor);

		if (read.status !== 'ok') {
			toast.error(t(read.status));
			return;
		}

		onApply(read.draft);
		toast.success(t('applied'));
	}

	return (
		<div className="flex flex-col gap-3">
			<Textarea
				value={text}
				onChange={(event) => {
					setText(event.target.value);
				}}
				aria-label={t('label')}
				placeholder={t('placeholder')}
				className="min-h-40 font-mono text-caption"
				spellCheck={false}
			/>

			<div className="flex flex-wrap items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => {
						void copy();
					}}
				>
					<ClipboardCopy aria-hidden="true" />
					{t('copy')}
				</Button>

				<Button variant="outline" size="sm" disabled={text.trim() === ''} onClick={apply}>
					<ClipboardPaste aria-hidden="true" />
					{t('apply')}
				</Button>
			</div>
		</div>
	);
}
