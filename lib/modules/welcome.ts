import type { ChannelKind } from '@/lib/types/discord';
import type {
	EmbedDraft,
	MessageDraft,
	MessageVariable,
	WelcomeConfig,
	WelcomePingMode
} from '@/lib/types/modules';

export function welcomeVariables(guildName: string): MessageVariable[] {
	return [
		{ token: '{user}', key: 'user', sample: 'novato' },
		{ token: '{server}', key: 'server', sample: guildName }
	];
}

export const WELCOME_CHANNEL_KINDS: readonly ChannelKind[] = ['text', 'announcement'];

export const WELCOME_MESSAGE_MAX = 2000;

export const WELCOME_AUTO_ROLES_MAX = 5;

export const WELCOME_DELETE_AFTER_MAX = 86_400;

const PING_MODES: readonly WelcomePingMode[] = ['none', 'inline', 'ghost'];

export const FALLBACK_EMBED_COLOR = '#5865f2';

export function emptyEmbedDraft(defaultColor: string = FALLBACK_EMBED_COLOR): EmbedDraft {
	return {
		authorName: '',
		title: '',
		description: '',
		color: defaultColor,
		fields: [],
		imageUrl: '',
		thumbnailUrl: '',
		footerText: '',
		timestamp: false
	};
}

const asRecord = (value: unknown): Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value)
		? (value as Record<string, unknown>)
		: {};

const asString = (value: unknown, fallback: string): string =>
	typeof value === 'string' ? value : fallback;

const asBoolean = (value: unknown): boolean => value === true;

const asSnowflakeList = (value: unknown): string[] =>
	Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : [];

const asPingMode = (value: unknown): WelcomePingMode =>
	PING_MODES.find((mode) => mode === value) ?? 'none';

const asDeleteAfter = (value: unknown): number | null =>
	typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;

export function toEmbedDraft(value: unknown, defaultColor?: string): EmbedDraft {
	const raw = asRecord(value);
	const base = emptyEmbedDraft(defaultColor);

	return {
		...base,
		...raw,
		color: asString(raw.color, base.color),
		fields: Array.isArray(raw.fields) ? (raw.fields as EmbedDraft['fields']) : base.fields
	};
}

export function toWelcomeConfig(
	state: {
		enabled: boolean;
		config: Record<string, unknown>;
	},
	defaultColor?: string
): WelcomeConfig {
	const { config } = state;

	const message: MessageDraft = {
		mode: asBoolean(config.useEmbed) ? 'embed' : 'text',
		text: asString(config.message, ''),
		embed: toEmbedDraft(config.embed, defaultColor)
	};

	return {
		enabled: state.enabled,
		channelId: typeof config.channelId === 'string' ? config.channelId : null,
		message,
		autoRoleIds: asSnowflakeList(config.autoRoles),
		pingMode: asPingMode(config.pingMode),
		deleteAfter: asDeleteAfter(config.deleteAfter)
	};
}

export function toWelcomePatch(config: WelcomeConfig): Record<string, unknown> {
	return {
		channelId: config.channelId,
		message: config.message.text,
		useEmbed: config.message.mode === 'embed',
		embed: config.message.embed,
		autoRoles: config.autoRoleIds,
		pingMode: config.pingMode,
		deleteAfter: config.deleteAfter
	};
}
