import type { GuildModuleStateDto } from '@/lib/api-url';
import type { ChannelKind } from '@/lib/types/discord';
import type {
	ScheduledConfig,
	ScheduledMessage,
	ScheduleKind,
	Weekday
} from '@/lib/types/module-configs';
import type { MessageVariable } from '@/lib/types/modules';
import { emptyEmbedDraft, toEmbedDraft } from './welcome';

export const MAX_SCHEDULED_MESSAGES = 25;

export const MAX_SCHEDULED_NAME_LENGTH = 100;

export const MAX_SCHEDULED_CONTENT_LENGTH = 2000;

export const SCHEDULED_CHANNEL_KINDS: readonly ChannelKind[] = ['text', 'announcement'];

export const DEFAULT_TIME_OF_DAY = '09:00';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ScheduledMessageDto = {
	id: string;
	name: string;
	channelId: string;
	kind: ScheduleKind;
	runAt: string | null;
	days: Weekday[];
	timeOfDay: string;
	enabled: boolean;
	content: string;
	embed: Record<string, unknown>;
	timezone: string;
	lastRunAt: string | null;
	nextRunAt: string | null;
};

export type ScheduledMessagesDto = {
	messages: ScheduledMessageDto[];
	timezone: string;
};

export type ScheduledMessagePayload = {
	id: string | null;
	name: string;
	channelId: string | null;
	kind: ScheduleKind;
	runAt: string | null;
	days: Weekday[];
	timeOfDay: string;
	enabled: boolean;
	content: string;
	embed: Record<string, unknown>;
};

export function scheduledVariables(guildName: string): MessageVariable[] {
	return [
		{ token: '{server}', key: 'server', sample: guildName },
		{ token: '{memberCount}', key: 'memberCount', sample: '1.248' }
	];
}

export const isSavedId = (id: string): boolean => UUID.test(id);

const localInput = (iso: string | null): string => (iso === null ? '' : iso.slice(0, 16));

export function toScheduledMessage(
	dto: ScheduledMessageDto,
	defaultColor?: string
): ScheduledMessage {
	return {
		id: dto.id,
		name: dto.name,
		channelId: dto.channelId,
		kind: dto.kind,
		runAt: localInput(dto.runAt),
		days: dto.days,
		timeOfDay: dto.timeOfDay,
		enabled: dto.enabled,
		nextRunAt: dto.nextRunAt,
		lastRunAt: dto.lastRunAt,
		message: {
			mode: Object.keys(dto.embed).length > 0 ? 'embed' : 'text',
			text: dto.content,
			embed: toEmbedDraft(dto.embed, defaultColor)
		}
	};
}

export function toScheduledConfig(
	state: GuildModuleStateDto,
	page: ScheduledMessagesDto,
	defaultColor?: string
): ScheduledConfig {
	return {
		enabled: state.enabled,
		timezone: page.timezone,
		messages: page.messages.map((message) => toScheduledMessage(message, defaultColor))
	};
}

export const nameless = (messages: readonly ScheduledMessage[]): number =>
	messages.filter((message) => message.name.trim() === '').length;

export const unroutable = (messages: readonly ScheduledMessage[]): number =>
	messages.filter((message) => message.name.trim() !== '' && message.channelId === null).length;

export const speechless = (messages: readonly ScheduledMessage[]): number =>
	messages.filter(
		(message) =>
			message.name.trim() !== '' &&
			message.message.text.trim() === '' &&
			message.message.mode !== 'embed'
	).length;

export const dayless = (messages: readonly ScheduledMessage[]): number =>
	messages.filter(
		(message) =>
			message.name.trim() !== '' && message.kind === 'recurring' && message.days.length === 0
	).length;

export const dateless = (messages: readonly ScheduledMessage[]): number =>
	messages.filter(
		(message) => message.name.trim() !== '' && message.kind === 'once' && message.runAt === ''
	).length;

export const sendable = (message: ScheduledMessage): boolean =>
	message.name.trim() !== '' &&
	message.channelId !== null &&
	(message.message.mode === 'embed' || message.message.text.trim() !== '') &&
	(message.kind === 'once' ? message.runAt !== '' : message.days.length > 0);

export function toSchedulePayload(
	messages: readonly ScheduledMessage[]
): ScheduledMessagePayload[] {
	return messages
		.filter(sendable)
		.slice(0, MAX_SCHEDULED_MESSAGES)
		.map((message) => ({
			id: isSavedId(message.id) ? message.id : null,
			name: message.name.trim().slice(0, MAX_SCHEDULED_NAME_LENGTH),
			channelId: message.channelId,
			kind: message.kind,
			runAt: message.kind === 'once' ? new Date(message.runAt).toISOString() : null,
			days: message.kind === 'recurring' ? message.days : [],
			timeOfDay: message.timeOfDay,
			enabled: message.enabled,
			content: message.message.text.slice(0, MAX_SCHEDULED_CONTENT_LENGTH),
			embed: message.message.mode === 'embed' ? { ...message.message.embed } : {}
		}));
}

export function blankScheduledMessage(id: string, defaultColor?: string): ScheduledMessage {
	return {
		id,
		name: '',
		channelId: null,
		kind: 'recurring',
		runAt: '',
		days: ['mon'],
		timeOfDay: DEFAULT_TIME_OF_DAY,
		enabled: true,
		nextRunAt: null,
		lastRunAt: null,
		message: { mode: 'text', text: '', embed: emptyEmbedDraft(defaultColor) }
	};
}
