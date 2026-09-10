'use client';

import { Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { ChannelPicker } from '@/components/discord/ChannelPicker';
import { PageHeader } from '@/components/management/PageHeader';
import { DiscordPreview } from '@/components/modules/DiscordPreview';
import { EmbedJsonTools } from '@/components/modules/EmbedJsonTools';
import { MessageComposer } from '@/components/modules/MessageComposer';
import { SettingsSection } from '@/components/modules/SettingsSection';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { sendEmbed } from '@/lib/embeds-client';
import { useApiFailure } from '@/lib/hooks/useApiFailure';
import { emptyEmbedDraft } from '@/lib/modules/welcome';
import type { Channel, ChannelKind } from '@/lib/types/discord';
import type { EmbedDraft, MessageDraft } from '@/lib/types/modules';

type EmbedWorkshopScreenProps = {
	guildId: string;
	channels: Channel[];
	defaultColor: string;
	botName: string;
	botAvatarUrl: string | null;
};

const POSTABLE: readonly ChannelKind[] = ['text', 'announcement'];

const nothingToSay = (message: MessageDraft): boolean =>
	message.mode === 'text'
		? message.text.trim() === ''
		: message.embed.title.trim() === '' &&
			message.embed.description.trim() === '' &&
			message.embed.authorName.trim() === '' &&
			message.embed.imageUrl.trim() === '' &&
			message.embed.fields.length === 0;

export function EmbedWorkshopScreen({
	guildId,
	channels,
	defaultColor,
	botName,
	botAvatarUrl
}: EmbedWorkshopScreenProps) {
	const t = useTranslations('embeds');
	const describe = useApiFailure();
	const [message, setMessage] = useState<MessageDraft>({
		mode: 'embed',
		text: '',
		embed: emptyEmbedDraft(defaultColor)
	});
	const [channelId, setChannelId] = useState<string | null>(null);
	const [sending, setSending] = useState(false);

	const empty = nothingToSay(message);

	function applyEmbed(embed: EmbedDraft): void {
		setMessage({ ...message, mode: 'embed', embed });
	}

	async function post(): Promise<void> {
		if (channelId === null) return;

		setSending(true);

		const result = await sendEmbed(guildId, {
			channelId,
			content: message.mode === 'text' ? message.text : '',
			embed: message.mode === 'embed' ? message.embed : {}
		});

		setSending(false);

		if (result.status === 'error') {
			toast.error(t('send.failed'), { description: describe(result.failure) });
			return;
		}

		if (result.outcome === 'sent') {
			toast.success(t('send.sent'));
			return;
		}

		toast.warning(t('send.channelRefused'));
	}

	return (
		<div className="flex min-h-full w-full flex-col p-6 sm:p-8">
			<PageHeader title={t('title')} description={t('description')} />

			<div className="mt-6 grid flex-1 gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
				<div className="flex min-w-0 flex-col gap-6">
					<SettingsSection title={t('compose.title')} description={t('compose.description')}>
						<MessageComposer value={message} onChange={setMessage} variables={[]} />
					</SettingsSection>

					<SettingsSection title={t('json.title')} description={t('json.description')}>
						<EmbedJsonTools
							embed={message.embed}
							defaultColor={defaultColor}
							onApply={applyEmbed}
						/>
					</SettingsSection>
				</div>

				<aside className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-6 xl:self-start">
					<Card title={t('preview.title')} description={t('preview.description')}>
						<DiscordPreview
							message={message}
							variables={[]}
							botName={botName}
							botAvatarUrl={botAvatarUrl}
						/>
					</Card>

					<Card title={t('send.title')} description={t('send.description')}>
						<div className="flex flex-col gap-4">
							<Field label={t('send.channel')}>
								<ChannelPicker
									channels={channels}
									kinds={POSTABLE}
									value={channelId}
									onValueChange={setChannelId}
								/>
							</Field>

							<Button
								loading={sending}
								disabled={channelId === null || empty}
								onClick={() => {
									void post();
								}}
							>
								<Send aria-hidden="true" />
								{t('send.action')}
							</Button>

							<p className="text-caption font-normal text-text-muted">{t('send.note')}</p>
						</div>
					</Card>
				</aside>
			</div>
		</div>
	);
}
