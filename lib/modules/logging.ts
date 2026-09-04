import type { GuildModuleStateDto } from '@/lib/api-url';
import type { LogEvent, LoggingConfig } from '@/lib/types/module-configs';

export const MAX_IGNORED_CHANNELS = 25;

export const MAX_IGNORED_ROLES = 25;

export type LogDestinationDto = {
	eventType: string;
	group: string;
	channelId: string | null;
	enabled: boolean;
};

export type LogRoutePayload = {
	eventType: string;
	channelId: string | null;
	enabled: boolean;
};

const asIdList = (value: unknown, limit: number): string[] =>
	Array.isArray(value)
		? value.filter((entry): entry is string => typeof entry === 'string').slice(0, limit)
		: [];

export const toLoggingConfig = (
	state: GuildModuleStateDto,
	events: readonly LogDestinationDto[]
): LoggingConfig => ({
	enabled: state.enabled,
	events: events.map((event) => ({
		id: event.eventType,
		group: event.group,
		channelId: event.channelId,
		enabled: event.enabled
	})),
	ignoredChannelIds: asIdList(state.config['ignoredChannelIds'], MAX_IGNORED_CHANNELS),
	ignoredRoleIds: asIdList(state.config['ignoredRoleIds'], MAX_IGNORED_ROLES)
});

export const toLoggingPatch = (config: LoggingConfig): Record<string, unknown> => ({
	ignoredChannelIds: config.ignoredChannelIds,
	ignoredRoleIds: config.ignoredRoleIds
});

export const toRoutePayload = (events: readonly LogEvent[]): LogRoutePayload[] =>
	events.map((event) => ({
		eventType: event.id,
		channelId: event.channelId,
		enabled: event.enabled
	}));

export const groupsInOrder = (events: readonly LogEvent[]): string[] => [
	...new Set(events.map((event) => event.group))
];

export const missingChannel = (events: readonly LogEvent[]): LogEvent[] =>
	events.filter((event) => event.enabled && event.channelId === null);
