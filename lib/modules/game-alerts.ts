import { toEmbedDraft, type ApiEmbedDto } from '@/lib/modules/log-preview';
import type { ChannelKind } from '@/lib/types/discord';
import type { GameAlertsConfig, GameStoreId } from '@/lib/types/module-configs';
import type { MessageDraft, MessageVariable } from '@/lib/types/modules';

export const GAME_STORES: readonly GameStoreId[] = ['epic'];

export const STORE_NAMES: Readonly<Record<GameStoreId, string>> = { epic: 'Epic Games Store' };

export const GAME_ALERT_CHANNEL_KINDS: readonly ChannelKind[] = ['text', 'announcement'];

export const GAME_ALERT_PING_ROLES_MAX = 5;

const EVERYONE = '@everyone';

export type GameAlertDraftBody = {
	stores: GameStoreId[];
	pingRoleIds: string[];
	pingEveryone: boolean;
	showUpcoming: boolean;
};

export type TokenWords = {
	roleName: (id: string) => string | null;
	unknownRole: string;
	absolute: (at: Date) => string;
};

export type PreviewLink = {
	label: string;
	url: string;
};

export type PreviewShape = {
	message: MessageDraft;
	lead: string;
	links: PreviewLink[];
	nextUpAt: Date | null;
};

type PreviewText = {
	content: string;
	embeds: ApiEmbedDto[];
};

type PreviewBody = PreviewText & {
	components: { components: PreviewLink[] }[];
};

const ROLE_MENTION = /<@&(\d+)>/gu;

const MOMENT = /<t:(\d+):f>/gu;

const isStore = (value: unknown): value is GameStoreId =>
	GAME_STORES.some((store) => store === value);

const asIds = (value: unknown): string[] =>
	Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];

export function toGameAlertsConfig(state: {
	enabled: boolean;
	config: Record<string, unknown>;
}): GameAlertsConfig {
	const { config } = state;

	return {
		enabled: state.enabled,
		channelId: typeof config.channelId === 'string' ? config.channelId : null,
		stores: Array.isArray(config.stores) ? config.stores.filter(isStore) : [...GAME_STORES],
		pingRoleIds: asIds(config.pingRoleIds),
		pingEveryone: config.pingEveryone === true,
		showUpcoming: config.showUpcoming !== false
	};
}

export const toPreviewBody = (config: GameAlertsConfig): GameAlertDraftBody => ({
	stores: config.stores,
	pingRoleIds: config.pingRoleIds,
	pingEveryone: config.pingEveryone,
	showUpcoming: config.showUpcoming
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

export function discordTokens(text: string, words: TokenWords): MessageVariable[] {
	const found = new Map<string, MessageVariable>();

	if (text.includes(EVERYONE)) {
		found.set(EVERYONE, { token: EVERYONE, key: 'everyone', sample: EVERYONE });
	}

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

		found.set(match[0], {
			token: match[0],
			key: `moment.${seconds}`,
			sample: words.absolute(new Date(Number(seconds) * 1000))
		});
	}

	return [...found.values()];
}

export const previewTextOf = (preview: PreviewText): string =>
	[
		preview.content,
		...preview.embeds.flatMap((embed) => [
			embed.title ?? '',
			embed.description ?? '',
			embed.footer?.text ?? ''
		])
	].join('\n');

export function previewShape(preview: PreviewBody): PreviewShape | null {
	const [card] = preview.embeds;

	if (card === undefined) return null;

	return {
		message: { mode: 'embed', text: '', embed: toEmbedDraft(card) },
		lead: preview.content,
		links: preview.components.flatMap((row) =>
			row.components.map(({ label, url }) => ({ label, url }))
		),
		nextUpAt: card.timestamp === undefined ? null : new Date(card.timestamp)
	};
}
