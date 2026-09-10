import type { GuildModuleStateDto } from '@/lib/api-url';
import type { EmbedDraft } from '@/lib/types/modules';
import type { LogEvent, LoggingConfig } from '@/lib/types/module-configs';

export const MAX_IGNORED_CHANNELS = 25;

export const MAX_IGNORED_ROLES = 25;

export type LogTemplate = Record<string, unknown>;

export type LogDestinationDto = {
	eventType: string;
	group: string;
	channelId: string | null;
	enabled: boolean;
	template: LogTemplate | null;
};

export type LogRoutePayload = {
	eventType: string;
	channelId: string | null;
	enabled: boolean;
	template: LogTemplate | null;
};

const read = (value: unknown): string => (typeof value === 'string' ? value : '');

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
		enabled: event.enabled,
		template: event.template
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
		enabled: event.enabled,
		template: event.template
	}));

export const groupsInOrder = (events: readonly LogEvent[]): string[] => [
	...new Set(events.map((event) => event.group))
];

export const missingChannel = (events: readonly LogEvent[]): LogEvent[] =>
	events.filter((event) => event.enabled && event.channelId === null);

const written = (value: string): boolean => value.trim() !== '';

export const toLogTemplate = (draft: EmbedDraft): LogTemplate | null => {
	const fields = draft.fields.filter((one) => written(one.name) && written(one.value));

	const template: LogTemplate = {
		...(written(draft.authorName) ? { authorName: draft.authorName } : {}),
		...(written(draft.authorIconUrl ?? '') ? { authorIconUrl: draft.authorIconUrl } : {}),
		...(written(draft.title) ? { title: draft.title } : {}),
		...(written(draft.description) ? { description: draft.description } : {}),
		...(written(draft.color) ? { color: draft.color } : {}),
		...(written(draft.imageUrl) ? { imageUrl: draft.imageUrl } : {}),
		...(written(draft.thumbnailUrl) ? { thumbnailUrl: draft.thumbnailUrl } : {}),
		...(written(draft.footerText) ? { footerText: draft.footerText } : {}),
		...(draft.timestamp ? { timestamp: true } : {}),
		...(fields.length === 0
			? {}
			: {
					fields: fields.map((one) => ({
						name: one.name,
						value: one.value,
						inline: one.inline
					}))
				})
	};

	const speaks =
		template['authorName'] !== undefined ||
		template['title'] !== undefined ||
		template['description'] !== undefined ||
		template['imageUrl'] !== undefined ||
		template['fields'] !== undefined;

	return speaks ? template : null;
};

export const toTemplateDraft = (template: LogTemplate | null): EmbedDraft => {
	const raw = template ?? {};
	const fields = Array.isArray(raw['fields']) ? raw['fields'] : [];

	return {
		authorName: read(raw['authorName']),
		authorIconUrl: read(raw['authorIconUrl']),
		title: read(raw['title']),
		description: read(raw['description']),
		color: read(raw['color']),
		imageUrl: read(raw['imageUrl']),
		thumbnailUrl: read(raw['thumbnailUrl']),
		footerText: read(raw['footerText']),
		timestamp: raw['timestamp'] === true,
		fields: fields.map((one, index) => {
			const entry = typeof one === 'object' && one !== null ? (one as Record<string, unknown>) : {};

			return {
				id: `template-${String(index)}`,
				name: read(entry['name']),
				value: read(entry['value']),
				inline: entry['inline'] === true
			};
		})
	};
};
