import type { GuildModuleStateDto } from '@/lib/api-url';
import type { ChannelKind } from '@/lib/types/discord';

export const MODERATION_LOG_CHANNEL_KINDS: readonly ChannelKind[] = ['text'];

export const MAX_PROTECTED_ROLES = 25;

export const MAX_ESCALATION_PING_ROLES = 10;

export const MAX_DM_EXTRA_LENGTH = 1000;

export const MAX_APPEAL_URL_LENGTH = 300;

export const MAX_PURGE_DAYS = 7;

export const TIMEOUT_KEYS = ['60s', '5m', '10m', '1h', '1d', '1w', '2w', '28d'] as const;

export type TimeoutKey = (typeof TIMEOUT_KEYS)[number];

export const AUTO_ACTIONS = ['warn', 'timeout', 'mute', 'kick', 'softban', 'ban'] as const;

export type AutoAction = (typeof AUTO_ACTIONS)[number];

export type ModerationConfig = {
	enabled: boolean;
	logChannelId: string | null;
	mutedRoleId: string | null;
	dmOnAction: boolean;
	requireReason: boolean;
	protectedRoleIds: string[];
	banPurgeDays: number;
	softbanPurgeDays: number;
	timeoutDefault: TimeoutKey;
	dmExtra: string;
	appealUrl: string;
	escalationChannelId: string | null;
	escalationPingRoleIds: string[];
	escalationAutoActions: AutoAction[];
	escalationWindowDays: number;
};

const asId = (value: unknown): string | null => (typeof value === 'string' ? value : null);

const asText = (value: unknown): string => (typeof value === 'string' ? value : '');

const asIdList = (value: unknown, limit: number): string[] =>
	Array.isArray(value)
		? value.filter((entry): entry is string => typeof entry === 'string').slice(0, limit)
		: [];

export const asPurgeDays = (value: unknown, fallback: number): number =>
	typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= MAX_PURGE_DAYS
		? value
		: fallback;

export const asTimeoutKey = (value: unknown): TimeoutKey =>
	TIMEOUT_KEYS.find((key) => key === value) ?? '1h';

export const MIN_WINDOW_DAYS = 1;

export const MAX_WINDOW_DAYS = 365;

export const DEFAULT_WINDOW_DAYS = 30;

export const asWindowDays = (value: unknown): number =>
	typeof value === 'number' &&
	Number.isInteger(value) &&
	value >= MIN_WINDOW_DAYS &&
	value <= MAX_WINDOW_DAYS
		? value
		: DEFAULT_WINDOW_DAYS;

export const asAutoActions = (value: unknown): AutoAction[] =>
	Array.isArray(value) ? AUTO_ACTIONS.filter((action) => value.includes(action)) : [];

export function toModerationConfig(state: GuildModuleStateDto): ModerationConfig {
	const { config } = state;

	return {
		enabled: state.enabled,
		logChannelId: asId(config.logChannelId),
		mutedRoleId: asId(config.mutedRoleId),
		dmOnAction: config.dmOnAction !== false,
		requireReason: config.requireReason === true,
		protectedRoleIds: asIdList(config.protectedRoleIds, MAX_PROTECTED_ROLES),
		banPurgeDays: asPurgeDays(config.banPurgeDays, 0),
		softbanPurgeDays: asPurgeDays(config.softbanPurgeDays, 1),
		timeoutDefault: asTimeoutKey(config.timeoutDefault),
		dmExtra: asText(config.dmExtra),
		appealUrl: asText(config.appealUrl),
		escalationChannelId: asId(config.escalationChannelId),
		escalationPingRoleIds: asIdList(config.escalationPingRoleIds, MAX_ESCALATION_PING_ROLES),
		escalationAutoActions: asAutoActions(config.escalationAutoActions),
		escalationWindowDays: asWindowDays(config.escalationWindowDays)
	};
}

export function toModerationPatch(config: ModerationConfig): Record<string, unknown> {
	return {
		logChannelId: config.logChannelId,
		mutedRoleId: config.mutedRoleId,
		dmOnAction: config.dmOnAction,
		requireReason: config.requireReason,
		protectedRoleIds: config.protectedRoleIds,
		banPurgeDays: config.banPurgeDays,
		softbanPurgeDays: config.softbanPurgeDays,
		timeoutDefault: config.timeoutDefault,
		dmExtra: config.dmExtra.trim() === '' ? null : config.dmExtra,
		appealUrl: config.appealUrl.trim() === '' ? null : config.appealUrl,
		escalationChannelId: config.escalationChannelId,
		escalationPingRoleIds: config.escalationPingRoleIds,
		escalationAutoActions: config.escalationAutoActions,
		escalationWindowDays: config.escalationWindowDays
	};
}

export function needsStaffCall(config: ModerationConfig): boolean {
	return config.escalationAutoActions.length < AUTO_ACTIONS.length;
}

export function escalationIsUnreachable(config: ModerationConfig): boolean {
	return needsStaffCall(config) && config.escalationChannelId === null;
}
