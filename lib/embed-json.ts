import type { EmbedDraft, EmbedField } from '@/lib/types/modules';
import { emptyEmbedDraft, toEmbedDraft } from '@/lib/modules/welcome';
import { newId } from '@/lib/utils/id';

const HEX = /^#?([0-9a-f]{6})$/i;

const asRecord = (value: unknown): Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: {};

const asText = (value: unknown): string => (typeof value === 'string' ? value : '');

export function colorNumberOf(hex: string): number | null {
	const match = HEX.exec(hex.trim());

	return match === null ? null : Number.parseInt(match[1] ?? '', 16);
}

export function colorHexOf(value: unknown): string | null {
	if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) return null;

	return `#${value.toString(16).padStart(6, '0')}`;
}

export function toDiscordEmbed(draft: EmbedDraft, now: Date = new Date()): Record<string, unknown> {
	const color = colorNumberOf(draft.color);
	const fields = draft.fields
		.filter((field) => field.name.trim() !== '' && field.value.trim() !== '')
		.map((field) => ({ name: field.name, value: field.value, inline: field.inline }));

	return {
		...(draft.title.trim() === '' ? {} : { title: draft.title }),
		...(draft.description.trim() === '' ? {} : { description: draft.description }),
		...(color === null ? {} : { color }),
		...(draft.timestamp ? { timestamp: now.toISOString() } : {}),
		...(draft.authorName.trim() === ''
			? {}
			: {
					author: {
						name: draft.authorName,
						...((draft.authorIconUrl ?? '').trim() === '' ? {} : { icon_url: draft.authorIconUrl })
					}
				}),
		...(draft.footerText.trim() === '' ? {} : { footer: { text: draft.footerText } }),
		...(draft.imageUrl.trim() === '' ? {} : { image: { url: draft.imageUrl } }),
		...(draft.thumbnailUrl.trim() === '' ? {} : { thumbnail: { url: draft.thumbnailUrl } }),
		...(fields.length === 0 ? {} : { fields })
	};
}

const OUR_OWN_KEYS = [
	'authorName',
	'authorIconUrl',
	'footerText',
	'imageUrl',
	'thumbnailUrl'
] as const;

const looksLikeOurDraft = (raw: Record<string, unknown>): boolean =>
	OUR_OWN_KEYS.some((key) => key in raw);

const fieldsOf = (value: unknown): EmbedField[] => {
	if (!Array.isArray(value)) return [];

	return value.map((entry): EmbedField => {
		const raw = asRecord(entry);

		return {
			id: asText(raw.id) === '' ? newId('embed') : asText(raw.id),
			name: asText(raw.name),
			value: asText(raw.value),
			inline: raw.inline === true
		};
	});
};

function fromDiscordShape(raw: Record<string, unknown>, defaultColor: string): EmbedDraft {
	const author = asRecord(raw.author);
	const footer = asRecord(raw.footer);
	const image = asRecord(raw.image);
	const thumbnail = asRecord(raw.thumbnail);

	return {
		authorName: asText(author.name),
		authorIconUrl: asText(author.icon_url),
		title: asText(raw.title),
		description: asText(raw.description),
		color: colorHexOf(raw.color) ?? (asText(raw.color) === '' ? defaultColor : asText(raw.color)),
		fields: fieldsOf(raw.fields),
		imageUrl: asText(image.url),
		thumbnailUrl: asText(thumbnail.url),
		footerText: asText(footer.text),
		timestamp: 'timestamp' in raw && raw.timestamp !== null
	};
}

export type EmbedJsonRead =
	{ status: 'ok'; draft: EmbedDraft } | { status: 'unreadable' } | { status: 'notAnEmbed' };

export function readEmbedJson(text: string, defaultColor: string): EmbedJsonRead {
	if (text.trim() === '') return { status: 'unreadable' };

	let parsed: unknown;

	try {
		parsed = JSON.parse(text);
	} catch {
		return { status: 'unreadable' };
	}

	const outer = asRecord(parsed);
	const first = Array.isArray(outer.embeds) ? asRecord(outer.embeds[0]) : outer;

	if (Object.keys(first).length === 0) return { status: 'notAnEmbed' };

	const draft = looksLikeOurDraft(first)
		? toEmbedDraft(first, defaultColor)
		: fromDiscordShape(first, defaultColor);

	const filled = { ...emptyEmbedDraft(defaultColor), ...draft, fields: fieldsOf(first.fields) };

	const saysSomething =
		filled.title.trim() !== '' ||
		filled.description.trim() !== '' ||
		filled.authorName.trim() !== '' ||
		filled.imageUrl.trim() !== '' ||
		filled.fields.length > 0;

	return saysSomething ? { status: 'ok', draft: filled } : { status: 'notAnEmbed' };
}
