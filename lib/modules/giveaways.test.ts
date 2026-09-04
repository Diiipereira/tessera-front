import { describe, expect, it } from 'vitest';
import type { GuildModuleStateDto } from '@/lib/api-url';
import { giveawayQuery } from '@/lib/giveaways-client';
import type { Giveaway } from '@/lib/types/module-configs';
import {
	MAX_GIVEAWAY_MINUTES,
	MAX_PRIZE_LENGTH,
	MAX_REQUIRED_LEVEL,
	MAX_REQUIRED_ROLES,
	MAX_WINNERS,
	MINUTES_IN_HOUR,
	colourFor,
	countBy,
	initialsOf,
	nameOf,
	toGiveaway,
	toGiveaways,
	toGiveawaysConfig,
	toGiveawaysPatch,
	toStartPayload,
	type GiveawayDto
} from './giveaways';

const GIVEAWAY_UUID = 'e6b3e0a2-1111-4222-8333-444444444444';
const CHANNEL = '901234567890123008';
const BOOSTER = '901234567890123001';
const ALICE = '111111111111111111';
const BRUNO = '222222222222222222';

const state = (config: Record<string, unknown> = {}, enabled = true): GuildModuleStateDto => ({
	key: 'giveaways',
	enabled,
	config,
	version: 4
});

const dto = (patch: Partial<GiveawayDto> = {}): GiveawayDto => ({
	id: GIVEAWAY_UUID,
	channelId: CHANNEL,
	messageId: '901234567890123020',
	prize: 'Nitro for a month',
	description: null,
	winnersCount: 1,
	requiredRoleIds: [],
	requiredLevel: null,
	bonusEntries: {},
	host: { id: ALICE, username: 'alice', globalName: 'Alice', avatarHash: null },
	winners: [],
	entries: 284,
	status: 'active',
	endsAt: '2026-09-04T12:00:00.000Z',
	endedAt: null,
	createdAt: '2026-09-04T10:00:00.000Z',
	...patch
});

const started = (patch: Partial<Parameters<typeof toStartPayload>[0]> = {}) =>
	toStartPayload({
		channelId: CHANNEL,
		prize: 'Nitro',
		description: '',
		winners: 1,
		hours: 24,
		requiredRoleIds: [],
		requiredLevel: 0,
		...patch
	});

const giveaway = (patch: Partial<Giveaway> = {}): Giveaway => ({ ...toGiveaway(dto()), ...patch });

describe('toGiveawaysConfig', () => {
	it('takes whether the module is on from the module state', () => {
		expect(toGiveawaysConfig(state({}, false)).enabled).toBe(false);
	});

	it('reads a guild that configured nothing as a working default', () => {
		expect(toGiveawaysConfig(state())).toEqual({
			enabled: true,
			defaultWinners: 1,
			dmWinners: true
		});
	});

	it('keeps the number of winners the guild chose', () => {
		expect(toGiveawaysConfig(state({ defaultWinners: 3 })).defaultWinners).toBe(3);
	});

	it('survives a winner count an older schema wrote as text', () => {
		expect(toGiveawaysConfig(state({ defaultWinners: '3' })).defaultWinners).toBe(1);
	});

	it('clamps a count the API would refuse anyway', () => {
		expect(toGiveawaysConfig(state({ defaultWinners: 9999 })).defaultWinners).toBe(MAX_WINNERS);
	});

	it('never drops below one winner', () => {
		expect(toGiveawaysConfig(state({ defaultWinners: 0 })).defaultWinners).toBe(1);
	});

	it('only turns the winner message off when the guild said so', () => {
		expect(toGiveawaysConfig(state({ dmWinners: false })).dmWinners).toBe(false);
		expect(toGiveawaysConfig(state({ dmWinners: 'no' })).dmWinners).toBe(true);
	});
});

describe('toGiveawaysPatch', () => {
	it('sends every guild setting the screen holds', () => {
		expect(toGiveawaysPatch(toGiveawaysConfig(state({ defaultWinners: 4 })))).toEqual({
			defaultWinners: 4,
			dmWinners: true
		});
	});

	it('never sends the giveaways, which have routes of their own', () => {
		expect(toGiveawaysPatch(toGiveawaysConfig(state()))).not.toHaveProperty('giveaways');
	});
});

describe('toGiveaway', () => {
	it('prefers the name the host goes by', () => {
		expect(toGiveaway(dto()).hostName).toBe('Alice');
	});

	it('falls back to the username, then to the id', () => {
		expect(
			toGiveaway(
				dto({ host: { id: ALICE, username: 'alice', globalName: null, avatarHash: null } })
			).hostName
		).toBe('alice');

		expect(
			toGiveaway(dto({ host: { id: BRUNO, username: null, globalName: null, avatarHash: null } }))
				.hostName
		).toBe(BRUNO);
	});

	it('gives an empty detail rather than the word null', () => {
		expect(toGiveaway(dto()).description).toBe('');
	});

	it('reads no level requirement as no level requirement', () => {
		expect(toGiveaway(dto()).requiredLevel).toBe(0);
	});

	it('keeps the level the host asked for', () => {
		expect(toGiveaway(dto({ requiredLevel: 5 })).requiredLevel).toBe(5);
	});

	it('names everyone who won', () => {
		const drawn = toGiveaway(
			dto({
				status: 'ended',
				endedAt: '2026-09-04T12:00:00.000Z',
				winners: [
					{ id: ALICE, username: 'alice', globalName: 'Alice', avatarHash: null },
					{ id: BRUNO, username: 'bruno', globalName: null, avatarHash: null }
				]
			})
		);

		expect(drawn.wonBy).toEqual(['Alice', 'bruno']);
	});

	it('hands the moments over untouched, so the screen says them in the reader language', () => {
		expect(toGiveaway(dto()).endsAt).toBe('2026-09-04T12:00:00.000Z');
	});

	it('gives the same host the same colour every time', () => {
		expect(colourFor(ALICE)).toBe(colourFor(ALICE));
	});

	it('reads a whole page at once', () => {
		expect(toGiveaways({ giveaways: [dto()], nextCursor: null, running: 1 })).toHaveLength(1);
	});
});

describe('toStartPayload', () => {
	it('sends what the dialog holds', () => {
		expect(started()).toMatchObject({ channelId: CHANNEL, prize: 'Nitro', winnersCount: 1 });
	});

	it('turns the hours the host typed into the minutes the API takes', () => {
		expect(started({ hours: 2 })?.minutes).toBe(2 * MINUTES_IN_HOUR);
	});

	it('refuses to send a giveaway with no channel to post it in', () => {
		expect(started({ channelId: null })).toBeNull();
	});

	it('refuses to send a giveaway with no prize', () => {
		expect(started({ prize: '   ' })).toBeNull();
	});

	it('trims the prize it sends', () => {
		expect(started({ prize: '  Nitro  ' })?.prize).toBe('Nitro');
	});

	it('never sends a prize longer than the API takes', () => {
		expect(started({ prize: 'a'.repeat(MAX_PRIZE_LENGTH + 50) })?.prize).toHaveLength(
			MAX_PRIZE_LENGTH
		);
	});

	it('sends no detail rather than an empty one', () => {
		expect(started({ description: '   ' })?.description).toBeNull();
	});

	it('never sends more winners than the API takes', () => {
		expect(started({ winners: 999 })?.winnersCount).toBe(MAX_WINNERS);
	});

	it('never sends fewer than one winner', () => {
		expect(started({ winners: 0 })?.winnersCount).toBe(1);
	});

	it('never sends a run longer than the API takes', () => {
		expect(started({ hours: 99_999 })?.minutes).toBe(MAX_GIVEAWAY_MINUTES);
	});

	it('never sends a giveaway that ends the instant it starts', () => {
		expect(started({ hours: 0 })?.minutes).toBe(1);
	});

	it('never sends more required roles than the API takes', () => {
		const roles = Array.from(
			{ length: MAX_REQUIRED_ROLES + 3 },
			(_, index) => `9012345678901230${String(index).padStart(2, '0')}`
		);

		expect(started({ requiredRoleIds: roles })?.requiredRoleIds).toHaveLength(MAX_REQUIRED_ROLES);
	});

	it('sends no level requirement when the host left it at zero', () => {
		expect(started({ requiredLevel: 0 })?.requiredLevel).toBeNull();
	});

	it('keeps the level the host asked for', () => {
		expect(started({ requiredLevel: 5 })?.requiredLevel).toBe(5);
	});

	it('never sends a level nobody can reach', () => {
		expect(started({ requiredLevel: 9999 })?.requiredLevel).toBe(MAX_REQUIRED_LEVEL);
	});

	it('keeps the roles the host chose', () => {
		expect(started({ requiredRoleIds: [BOOSTER] })?.requiredRoleIds).toEqual([BOOSTER]);
	});
});

describe('countBy', () => {
	it('counts the giveaways in each situation', () => {
		const rows = [giveaway(), giveaway({ id: 'other', state: 'ended' })];

		expect([countBy(rows, 'active'), countBy(rows, 'ended')]).toEqual([1, 1]);
	});
});

describe('nameOf and initialsOf', () => {
	it('shows the id when Discord had no name to give', () => {
		expect(nameOf({ id: BRUNO, username: null, globalName: null, avatarHash: null })).toBe(BRUNO);
	});

	it('takes two letters for the avatar', () => {
		expect(initialsOf('alice')).toBe('AL');
	});
});

describe('giveawayQuery', () => {
	it('asks for one situation', () => {
		expect(giveawayQuery(['active'], 25)).toBe('limit=25&status=active');
	});

	it('asks for both when the screen wants both', () => {
		expect(giveawayQuery(['active', 'ended'], 25)).toBe('limit=25&status=active&status=ended');
	});

	it('asks for no situation at all when the filter is off', () => {
		expect(giveawayQuery([], 50)).toBe('limit=50');
	});

	it('carries the cursor when there is another page', () => {
		expect(giveawayQuery(['active'], 10, `1788523200000.${GIVEAWAY_UUID}`)).toContain(
			'cursor=1788523200000'
		);
	});

	it('leaves the cursor out on the first page', () => {
		expect(giveawayQuery(['active'], 10)).not.toContain('cursor');
	});
});
