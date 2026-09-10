import type { EmbedDraft, MessageDraft, MessageVariable } from '@/lib/types/modules';

export type ApiEmbedFieldDto = {
	name: string;
	value: string;
	inline: boolean;
};

export type ApiEmbedDto = {
	title?: string;
	description?: string;
	color?: number;
	timestamp?: string;
	author?: { name: string; icon_url?: string };
	footer?: { text: string };
	thumbnail?: { url: string };
	image?: { url: string };
	fields?: ApiEmbedFieldDto[];
};

export type LogPreviewDto = {
	eventType: string;
	embed: ApiEmbedDto;
	variables: Record<string, string>;
};

export type LoggingPreviewDto = {
	names: Record<string, string>;
	previews: LogPreviewDto[];
};

const MENTION = /<(@&|@|#)(\d+)>/gu;

const MOMENT = /<t:(\d+):R>/gu;

const hex = (color: number | undefined): string => `#${(color ?? 0).toString(16).padStart(6, '0')}`;

export const toEmbedDraft = (embed: ApiEmbedDto): EmbedDraft => ({
	authorName: embed.author?.name ?? '',
	authorIconUrl: embed.author?.icon_url ?? '',
	title: embed.title ?? '',
	description: embed.description ?? '',
	color: hex(embed.color),
	fields: (embed.fields ?? []).map((one, index) => ({
		id: `${one.name}:${String(index)}`,
		name: one.name,
		value: one.value,
		inline: one.inline
	})),
	imageUrl: embed.image?.url ?? '',
	thumbnailUrl: embed.thumbnail?.url ?? '',
	footerText: embed.footer?.text ?? '',
	timestamp: embed.timestamp !== undefined
});

export const toMessageDraft = (embed: ApiEmbedDto): MessageDraft => ({
	mode: 'embed',
	text: '',
	embed: toEmbedDraft(embed)
});

const everyText = (embed: ApiEmbedDto): string =>
	[
		embed.title ?? '',
		embed.description ?? '',
		embed.footer?.text ?? '',
		...(embed.fields ?? []).flatMap((one) => [one.name, one.value])
	].join('\n');

export type MomentLabel = (at: Date) => string;

export function previewVariables(
	embed: ApiEmbedDto,
	names: Record<string, string>,
	unknown: string,
	moment: MomentLabel
): MessageVariable[] {
	const text = everyText(embed);
	const found = new Map<string, MessageVariable>();

	for (const match of text.matchAll(MENTION)) {
		const token = match[0];
		const id = match[2] ?? '';
		const name = names[id] ?? unknown;

		found.set(token, {
			token,
			key: `mention.${id}`,
			sample: `${match[1] === '#' ? '#' : '@'}${name}`
		});
	}

	for (const match of text.matchAll(MOMENT)) {
		const token = match[0];
		const seconds = Number(match[1] ?? '0');

		found.set(token, {
			token,
			key: `moment.${String(seconds)}`,
			sample: moment(new Date(seconds * 1000))
		});
	}

	return [...found.values()];
}
