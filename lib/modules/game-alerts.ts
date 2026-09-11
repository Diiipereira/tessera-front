import { toEmbedDraft as fromApiEmbed, type ApiEmbedDto } from '@/lib/modules/log-preview';
import { toEmbedDraft } from '@/lib/modules/welcome';
import type { ChannelKind } from '@/lib/types/discord';
import type { GameAlertsConfig, GameStoreId } from '@/lib/types/module-configs';
import type { EmbedDraft, MessageDraft, MessageVariable } from '@/lib/types/modules';

export const GAME_STORES: readonly GameStoreId[] = ['epic'];

export const STORE_NAMES: Readonly<Record<GameStoreId, string>> = { epic: 'Epic Games Store' };

export const GAME_ALERT_CHANNEL_KINDS: readonly ChannelKind[] = ['text', 'announcement'];

export const GAME_ALERT_PING_ROLES_MAX = 5;

export type GameAlertDraftBody = {
	stores: GameStoreId[];
	pingRoleIds: string[];
	showUpcoming: boolean;
	message: string | null;
	useEmbed: boolean;
	embed: EmbedDraft;
};

export type OfferSample = {
	title: string;
	url: string;
	endsAt: string;
};

export type VariableFallback = {
	game: string;
	until: string;
	url: string;
};

export type TokenWords = {
	roleName: (id: string) => string | null;
	unknownRole: string;
	absolute: (at: Date) => string;
	relative: (at: Date) => string;
};

export type PreviewShape = {
	message: MessageDraft;
	lead: string;
	more: EmbedDraft[];
};

type PreviewBody = {
	content: string;
	embeds: ApiEmbedDto[];
};

const ROLE_MENTION = /<@&(\d+)>/gu;

const MOMENT = /<t:(\d+):([fR])>/gu;

const isStore = (value: unknown): value is GameStoreId =>
	GAME_STORES.some((store) => store === value);

const asIds = (value: unknown): string[] =>
	Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];

export function toGameAlertsConfig(
	state: { enabled: boolean; config: Record<string, unknown> },
	defaultColor?: string
): GameAlertsConfig {
	const { config } = state;

	return {
		enabled: state.enabled,
		channelId: typeof config.channelId === 'string' ? config.channelId : null,
		stores: Array.isArray(config.stores) ? config.stores.filter(isStore) : [...GAME_STORES],
		pingRoleIds: asIds(config.pingRoleIds),
		showUpcoming: config.showUpcoming !== false,
		message: {
			mode: config.useEmbed === false ? 'text' : 'embed',
			text: typeof config.message === 'string' ? config.message : '',
			embed: toEmbedDraft(config.embed, defaultColor)
		}
	};
}

const lineOf = (message: MessageDraft): string | null =>
	message.text.trim() === '' ? null : message.text;

export const toPreviewBody = (config: GameAlertsConfig): GameAlertDraftBody => ({
	stores: config.stores,
	pingRoleIds: config.pingRoleIds,
	showUpcoming: config.showUpcoming,
	message: lineOf(config.message),
	useEmbed: config.message.mode === 'embed',
	embed: config.message.embed
});

export const toGameAlertsPatch = (config: GameAlertsConfig): Record<string, unknown> => ({
	channelId: config.channelId,
	...toPreviewBody(config)
});

export const toggleStore = (
	stores: readonly GameStoreId[],
	store: GameStoreId,
	on: boolean
): GameStoreId[] => {
	const chosen = new Set(stores);

	if (on) chosen.add(store);
	else chosen.delete(store);

	return GAME_STORES.filter((one) => chosen.has(one));
};

export const isBlankEmbed = (embed: EmbedDraft): boolean =>
	embed.authorName.trim() === '' &&
	embed.title.trim() === '' &&
	embed.description.trim() === '' &&
	embed.fields.length === 0 &&
	embed.imageUrl.trim() === '';

export function gameAlertVariables(
	sample: OfferSample | null,
	fallback: VariableFallback,
	formatUntil: (at: Date) => string
): MessageVariable[] {
	return [
		{ token: '{game}', key: 'game', sample: sample?.title ?? fallback.game },
		{ token: '{store}', key: 'store', sample: STORE_NAMES.epic },
		{
			token: '{until}',
			key: 'until',
			sample: sample === null ? fallback.until : formatUntil(new Date(sample.endsAt))
		},
		{ token: '{url}', key: 'url', sample: sample?.url ?? fallback.url }
	];
}

export function discordTokens(text: string, words: TokenWords): MessageVariable[] {
	const found = new Map<string, MessageVariable>();

	for (const match of text.matchAll(ROLE_MENTION)) {
		const id = match[1] ?? '';

		found.set(match[0], {
			token: match[0],
			key: `role.${id}`,
			sample: `@${words.roleName(id) ?? words.unknownRole}`
		});
	}

	for (const match of text.matchAll(MOMENT)) {
		const seconds = match[1] ?? '0';
		const at = new Date(Number(seconds) * 1000);

		found.set(match[0], {
			token: match[0],
			key: `moment.${seconds}.${match[2] ?? ''}`,
			sample: match[2] === 'R' ? words.relative(at) : words.absolute(at)
		});
	}

	return [...found.values()];
}

export const previewTextOf = (preview: PreviewBody): string =>
	[
		preview.content,
		...preview.embeds.flatMap((embed) => [
			embed.title ?? '',
			embed.description ?? '',
			embed.footer?.text ?? ''
		])
	].join('\n');

export function previewShape(preview: PreviewBody): PreviewShape {
	const [first, ...rest] = preview.embeds;

	if (first === undefined) {
		return {
			message: { mode: 'text', text: preview.content, embed: fromApiEmbed({}) },
			lead: '',
			more: []
		};
	}

	return {
		message: { mode: 'embed', text: '', embed: fromApiEmbed(first) },
		lead: preview.content,
		more: rest.map(fromApiEmbed)
	};
}
