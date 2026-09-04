import type { GuildModuleStateDto } from '@/lib/api-url';
import type { ChannelKind } from '@/lib/types/discord';
import type { Giveaway, GiveawayState, GiveawaysConfig } from '@/lib/types/module-configs';

export const MAX_PRIZE_LENGTH = 200;

export const MAX_GIVEAWAY_DESCRIPTION_LENGTH = 1000;

export const MAX_WINNERS = 50;

export const MAX_REQUIRED_ROLES = 10;

export const MAX_REQUIRED_LEVEL = 200;

export const MIN_GIVEAWAY_MINUTES = 1;

export const MAX_GIVEAWAY_MINUTES = 43_200;

export const MINUTES_IN_HOUR = 60;

export const MAX_GIVEAWAY_HOURS = MAX_GIVEAWAY_MINUTES / MINUTES_IN_HOUR;

export const GIVEAWAY_CHANNEL_KINDS: readonly ChannelKind[] = ['text', 'announcement'];

export type GiveawayPersonDto = {
	id: string;
	username: string | null;
	globalName: string | null;
	avatarHash: string | null;
};

export type GiveawayDto = {
	id: string;
	channelId: string;
	messageId: string | null;
	prize: string;
	description: string | null;
	winnersCount: number;
	requiredRoleIds: string[];
	requiredLevel: number | null;
	bonusEntries: Record<string, number>;
	host: GiveawayPersonDto;
	winners: GiveawayPersonDto[];
	entries: number;
	status: GiveawayState;
	endsAt: string;
	endedAt: string | null;
	createdAt: string;
};

export type GiveawaysDto = {
	giveaways: GiveawayDto[];
	nextCursor: string | null;
	running: number;
};

export type StartGiveawayPayload = {
	channelId: string;
	prize: string;
	description: string | null;
	winnersCount: number;
	minutes: number;
	requiredRoleIds: string[];
	requiredLevel: number | null;
};

const COLOURS = ['#5865f2', '#0d9488', '#d97706', '#db2777', '#57f287', '#eb459e'];

const asWhole = (value: unknown, fallback: number, low: number, high: number): number =>
	typeof value === 'number' && Number.isFinite(value)
		? Math.min(high, Math.max(low, Math.round(value)))
		: fallback;

export const colourFor = (userId: string): string => {
	const digits = userId.replace(/\D/g, '');
	const tail = Number(digits.slice(-4) || '0');

	return COLOURS[tail % COLOURS.length] ?? COLOURS[0] ?? '#5865f2';
};

export const nameOf = (person: GiveawayPersonDto): string =>
	person.globalName ?? person.username ?? person.id;

export const initialsOf = (name: string): string => name.slice(0, 2).toUpperCase();

export function toGiveawaysConfig(state: GuildModuleStateDto): GiveawaysConfig {
	return {
		enabled: state.enabled,
		defaultWinners: asWhole(state.config.defaultWinners, 1, 1, MAX_WINNERS),
		dmWinners: state.config.dmWinners !== false
	};
}

export function toGiveawaysPatch(config: GiveawaysConfig): Record<string, unknown> {
	return { defaultWinners: config.defaultWinners, dmWinners: config.dmWinners };
}

export function toGiveaway(dto: GiveawayDto): Giveaway {
	const host = nameOf(dto.host);

	return {
		id: dto.id,
		prize: dto.prize,
		description: dto.description ?? '',
		winners: dto.winnersCount,
		entries: dto.entries,
		channelId: dto.channelId,
		messageId: dto.messageId,
		hostName: host,
		hostInitials: initialsOf(host),
		hostColor: colourFor(dto.host.id),
		state: dto.status,
		endsAt: dto.endsAt,
		endedAt: dto.endedAt,
		wonBy: dto.winners.map(nameOf),
		requiredRoleIds: dto.requiredRoleIds,
		requiredLevel: dto.requiredLevel ?? 0
	};
}

export const toGiveaways = (page: GiveawaysDto): Giveaway[] => page.giveaways.map(toGiveaway);

export function toStartPayload(draft: {
	channelId: string | null;
	prize: string;
	description: string;
	winners: number;
	hours: number;
	requiredRoleIds: readonly string[];
	requiredLevel: number;
}): StartGiveawayPayload | null {
	if (draft.channelId === null || draft.prize.trim() === '') return null;

	return {
		channelId: draft.channelId,
		prize: draft.prize.trim().slice(0, MAX_PRIZE_LENGTH),
		description:
			draft.description.trim() === ''
				? null
				: draft.description.trim().slice(0, MAX_GIVEAWAY_DESCRIPTION_LENGTH),
		winnersCount: Math.min(MAX_WINNERS, Math.max(1, Math.round(draft.winners))),
		minutes: Math.min(
			MAX_GIVEAWAY_MINUTES,
			Math.max(MIN_GIVEAWAY_MINUTES, Math.round(draft.hours * MINUTES_IN_HOUR))
		),
		requiredRoleIds: draft.requiredRoleIds.slice(0, MAX_REQUIRED_ROLES),
		requiredLevel:
			draft.requiredLevel < 1 ? null : Math.min(MAX_REQUIRED_LEVEL, Math.round(draft.requiredLevel))
	};
}

export const countBy = (giveaways: readonly Giveaway[], state: GiveawayState): number =>
	giveaways.filter((giveaway) => giveaway.state === state).length;
