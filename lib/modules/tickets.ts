import type { GuildModuleStateDto } from '@/lib/api-url';
import type { ChannelKind } from '@/lib/types/discord';
import type {
	OpenTicket,
	TicketPanel,
	TicketStatus,
	TicketsConfig
} from '@/lib/types/module-configs';
import type { MessageVariable } from '@/lib/types/modules';
import { toEmbedDraft } from './welcome';

export const MAX_PANELS = 25;

export const MAX_PANEL_NAME_LENGTH = 100;

export const MAX_BUTTON_LABEL_LENGTH = 80;

export const MAX_NAMING_PATTERN_LENGTH = 90;

export const MAX_STAFF_ROLES = 10;

export const MAX_OPEN_PER_USER = 20;

export const MAX_PANEL_MESSAGE_LENGTH = 2000;

export const MAX_AUTO_CLOSE_HOURS = 720;

export const MAX_CLOSE_DELAY_SECONDS = 3600;

export const DEFAULT_NAMING_PATTERN = 'ticket-{number}';

export const PANEL_CHANNEL_KINDS: readonly ChannelKind[] = ['text', 'announcement'];

export const CATEGORY_KINDS: readonly ChannelKind[] = ['category'];

export const TRANSCRIPT_CHANNEL_KINDS: readonly ChannelKind[] = ['text'];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type TicketPanelDto = {
	id: string;
	name: string;
	channelId: string | null;
	messageId: string | null;
	categoryId: string | null;
	staffRoleIds: string[];
	namingPattern: string;
	maxOpenPerUser: number;
	buttonLabel: string;
	buttonEmoji: string | null;
	message: string;
	embed: Record<string, unknown>;
	enabled: boolean;
};

export type TicketPanelPayload = Omit<TicketPanelDto, 'id' | 'messageId'> & { id: string | null };

export type TicketPersonDto = {
	id: string;
	username: string | null;
	globalName: string | null;
	avatarHash: string | null;
};

export type TicketDto = {
	id: string;
	number: number;
	channelId: string;
	panelId: string | null;
	status: TicketStatus;
	subject: string | null;
	opener: TicketPersonDto;
	claimer: TicketPersonDto | null;
	participants: string[];
	rating: number | null;
	openedAt: string;
	lastActivityAt: string;
	closedAt: string | null;
	closeReason: string | null;
};

export type TicketsDto = {
	tickets: TicketDto[];
	nextCursor: number | null;
	open: number;
};

export function ticketVariables(guildName: string): MessageVariable[] {
	return [
		{ token: '{user}', key: 'user', sample: 'novato' },
		{ token: '{user.mention}', key: 'userMention', sample: '@novato' },
		{ token: '{server}', key: 'server', sample: guildName }
	];
}

const asWhole = (value: unknown, fallback: number, low: number, high: number): number =>
	typeof value === 'number' && Number.isFinite(value)
		? Math.min(high, Math.max(low, Math.round(value)))
		: fallback;

const asSnowflake = (value: unknown): string | null =>
	typeof value === 'string' && /^\d{17,20}$/.test(value) ? value : null;

export const isSavedId = (id: string): boolean => UUID.test(id);

export function toTicketPanel(dto: TicketPanelDto, defaultColor?: string): TicketPanel {
	return {
		id: dto.id,
		name: dto.name,
		channelId: dto.channelId,
		categoryId: dto.categoryId,
		staffRoleIds: dto.staffRoleIds,
		namingPattern: dto.namingPattern,
		maxOpenPerUser: dto.maxOpenPerUser,
		buttonLabel: dto.buttonLabel,
		buttonEmoji: dto.buttonEmoji,
		enabled: dto.enabled,
		message: {
			mode: Object.keys(dto.embed).length > 0 ? 'embed' : 'text',
			text: dto.message,
			embed: toEmbedDraft(dto.embed, defaultColor)
		}
	};
}

export function toTicketsConfig(
	state: GuildModuleStateDto,
	panels: readonly TicketPanelDto[],
	defaultColor?: string
): TicketsConfig {
	const { config } = state;

	return {
		enabled: state.enabled,
		panels: panels.map((panel) => toTicketPanel(panel, defaultColor)),
		transcriptChannelId: asSnowflake(config.transcriptChannelId),
		autoCloseHours: asWhole(config.autoCloseHours, 0, 0, MAX_AUTO_CLOSE_HOURS),
		askForRating: config.askForRating === true,
		closeDelaySeconds: asWhole(config.closeDelaySeconds, 10, 0, MAX_CLOSE_DELAY_SECONDS)
	};
}

export function toTicketsPatch(config: TicketsConfig): Record<string, unknown> {
	return {
		transcriptChannelId: config.transcriptChannelId,
		autoCloseHours: config.autoCloseHours,
		askForRating: config.askForRating,
		closeDelaySeconds: config.closeDelaySeconds
	};
}

export const nameless = (panels: readonly TicketPanel[]): number =>
	panels.filter((panel) => panel.name.trim() === '').length;

export function toPanelPayload(panels: readonly TicketPanel[]): TicketPanelPayload[] {
	return panels
		.filter((panel) => panel.name.trim() !== '')
		.slice(0, MAX_PANELS)
		.map((panel) => ({
			id: isSavedId(panel.id) ? panel.id : null,
			name: panel.name.trim().slice(0, MAX_PANEL_NAME_LENGTH),
			channelId: panel.channelId,
			categoryId: panel.categoryId,
			staffRoleIds: panel.staffRoleIds.slice(0, MAX_STAFF_ROLES),
			namingPattern:
				panel.namingPattern.trim() === ''
					? DEFAULT_NAMING_PATTERN
					: panel.namingPattern.trim().slice(0, MAX_NAMING_PATTERN_LENGTH),
			maxOpenPerUser: Math.min(MAX_OPEN_PER_USER, Math.max(1, Math.round(panel.maxOpenPerUser))),
			buttonLabel: panel.buttonLabel.trim().slice(0, MAX_BUTTON_LABEL_LENGTH),
			buttonEmoji: panel.buttonEmoji,
			message: panel.message.text.slice(0, MAX_PANEL_MESSAGE_LENGTH),
			embed: panel.message.mode === 'embed' ? { ...panel.message.embed } : {},
			enabled: panel.enabled
		}));
}

const initialsOf = (name: string): string => name.slice(0, 2).toUpperCase();

const COLOURS = ['#5865f2', '#0d9488', '#d97706', '#db2777', '#57f287', '#eb459e'];

export const colourFor = (userId: string): string => {
	const digits = userId.replace(/\D/g, '');
	const tail = Number(digits.slice(-4) || '0');

	return COLOURS[tail % COLOURS.length] ?? COLOURS[0] ?? '#5865f2';
};

export const nameOf = (person: TicketPersonDto): string =>
	person.globalName ?? person.username ?? person.id;

export function toOpenTickets(page: TicketsDto): OpenTicket[] {
	return page.tickets.map((ticket) => {
		const opener = nameOf(ticket.opener);

		return {
			id: ticket.id,
			number: ticket.number,
			subject: ticket.subject ?? '',
			openerName: opener,
			openerInitials: initialsOf(opener),
			openerColor: colourFor(ticket.opener.id),
			claimedBy: ticket.claimer === null ? null : nameOf(ticket.claimer),
			openedAt: ticket.openedAt,
			status: ticket.status
		};
	});
}
