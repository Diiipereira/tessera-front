'use client';

import { useTranslations } from 'next-intl';
import { DiscordPreview } from '@/components/modules/DiscordPreview';
import type { MessageDraft, MessageVariable } from '@/lib/types/modules';

type MessagePreviewProps = {
	message: MessageDraft;
	variables: MessageVariable[];
	botName?: string;
	botAvatarUrl?: string | null;
	note?: string;
};

export function MessagePreview({
	message,
	variables,
	botName,
	botAvatarUrl,
	note
}: MessagePreviewProps) {
	const t = useTranslations('modules.preview');

	return (
		<section className="flex flex-col gap-2">
			<h3 className="text-body-sm font-medium">{t('title')}</h3>

			<DiscordPreview
				message={message}
				variables={variables}
				botName={botName}
				botAvatarUrl={botAvatarUrl}
			/>

			<p className="text-caption font-normal text-text-muted">{note ?? t('note')}</p>
		</section>
	);
}
