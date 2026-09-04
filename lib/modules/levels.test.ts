import { describe, expect, it } from 'vitest';
import type { GuildModuleStateDto } from '@/lib/api-url';
import type { LevelsConfig, RoleReward } from '@/lib/types/module-configs';
import {
	MAX_REWARDS,
	colourFor,
	levelVariables,
	rewardId,
	roleless,
	toLeaderboard,
	toLevelsConfig,
	toLevelsPatch,
	toRewardPayload,
	type LevelRewardDto
} from './levels';

const NOVICE = '801234567890123001';
const REGULAR = '801234567890123002';
const CHANNEL = '901234567890123008';

const state = (config: Record<string, unknown> = {}, enabled = true): GuildModuleStateDto => ({
	key: 'levels',
	configured: true,
	enabled,
	config,
	version: 3
});

const reward = (patch: Partial<LevelRewardDto> = {}): LevelRewardDto => ({
	level: 5,
	roleId: NOVICE,
	removePrevious: false,
	...patch
});

const draft = (patch: Partial<LevelsConfig> = {}): LevelsConfig => ({
	...toLevelsConfig(state(), []),
	...patch
});

const row = (patch: Partial<RoleReward> = {}): RoleReward => ({
	id: 'rw1',
	level: 5,
	roleId: NOVICE,
	removePrevious: false,
	...patch
});

describe('toLevelsConfig', () => {
	it('takes whether the module is on from the module state', () => {
		expect(toLevelsConfig(state({}, false), []).enabled).toBe(false);
	});

	it('falls back to the numbers a new guild starts with', () => {
		const config = toLevelsConfig(state(), []);

		expect([config.xpMin, config.xpMax, config.cooldownSeconds, config.curve]).toEqual([
			15, 25, 60, 100
		]);
	});

	it('keeps the numbers the guild wrote', () => {
		expect(toLevelsConfig(state({ xpMin: 3, xpMax: 9 }), []).xpMin).toBe(3);
	});

	it('clamps a number the API would refuse anyway', () => {
		expect(toLevelsConfig(state({ curve: 9000 }), []).curve).toBe(500);
	});

	it('reads a number that is not a number as the default', () => {
		expect(toLevelsConfig(state({ curve: 'steep' }), []).curve).toBe(100);
	});

	it('reads the announcement as text when the guild did not choose a card', () => {
		expect(
			toLevelsConfig(state({ announceMessage: 'gg {user}' }), []).announceMessage
		).toMatchObject({ mode: 'text', text: 'gg {user}' });
	});

	it('reads the announcement as a card when the guild chose one', () => {
		expect(toLevelsConfig(state({ announceUseEmbed: true }), []).announceMessage.mode).toBe(
			'embed'
		);
	});

	it('gives each reward an id built from the level and the role, since the API has none', () => {
		expect(toLevelsConfig(state(), [reward()]).rewards[0]?.id).toBe(`5:${NOVICE}`);
	});

	it('keeps two rewards on the same level apart', () => {
		const ids = toLevelsConfig(state(), [reward(), reward({ roleId: REGULAR })]).rewards.map(
			(entry) => entry.id
		);

		expect(new Set(ids).size).toBe(2);
	});

	it('drops a channel id that is not a string', () => {
		expect(
			toLevelsConfig(state({ noXpChannelIds: [CHANNEL, 7, null] }), []).noXpChannelIds
		).toEqual([CHANNEL]);
	});
});

describe('toLevelsPatch', () => {
	it('sends the numbers the screen holds', () => {
		expect(toLevelsPatch(draft({ curve: 250 })).curve).toBe(250);
	});

	it('sends an inverted range the right way round, since the API reads it that way', () => {
		const patch = toLevelsPatch(draft({ xpMin: 40, xpMax: 10 }));

		expect([patch.xpMin, patch.xpMax]).toEqual([10, 40]);
	});

	it('says whether the announcement is a card', () => {
		const config = draft();

		expect(
			toLevelsPatch({
				...config,
				announceMessage: { ...config.announceMessage, mode: 'embed' }
			}).announceUseEmbed
		).toBe(true);
	});

	it('never sends an announcement longer than Discord takes', () => {
		const config = draft();
		const patch = toLevelsPatch({
			...config,
			announceMessage: { ...config.announceMessage, text: 'a'.repeat(3000) }
		});

		expect(String(patch.announceMessage)).toHaveLength(2000);
	});

	it('never sends the rewards, which have a route of their own', () => {
		expect(toLevelsPatch(draft())).not.toHaveProperty('rewards');
	});
});

describe('toRewardPayload', () => {
	it('sends the level, the role and whether it replaces', () => {
		expect(toRewardPayload([row({ removePrevious: true })])).toEqual([
			{ level: 5, roleId: NOVICE, removePrevious: true }
		]);
	});

	it('leaves out a reward that never got a role, since it would hand over nothing', () => {
		expect(toRewardPayload([row(), row({ id: 'rw2', level: 9, roleId: null })])).toHaveLength(1);
	});

	it('never sends the local id, which the API would refuse', () => {
		expect(toRewardPayload([row()])[0]).not.toHaveProperty('id');
	});

	it('pulls a level below the floor up to it', () => {
		expect(toRewardPayload([row({ level: 0 })])[0]?.level).toBe(1);
	});

	it('pulls a level above the ceiling down to it', () => {
		expect(toRewardPayload([row({ level: 5000 })])[0]?.level).toBe(999);
	});

	it('sends the same role on one level only once, which the API would call a duplicate', () => {
		expect(toRewardPayload([row(), row({ id: 'rw2' })])).toHaveLength(1);
	});

	it('keeps two different roles on the same level', () => {
		expect(toRewardPayload([row(), row({ id: 'rw2', roleId: REGULAR })])).toHaveLength(2);
	});

	it('never sends more rewards than the API would take', () => {
		const many = Array.from({ length: MAX_REWARDS + 5 }, (_, index) =>
			row({ id: `rw${String(index)}`, level: index + 1 })
		);

		expect(toRewardPayload(many)).toHaveLength(MAX_REWARDS);
	});
});

describe('what the screen warns about', () => {
	it('counts the rewards that would be dropped on save', () => {
		expect(roleless([row(), row({ id: 'rw2', roleId: null })])).toBe(1);
	});

	it('has nothing to warn about when every reward hands over a role', () => {
		expect(roleless([row()])).toBe(0);
	});
});

describe('toLeaderboard', () => {
	it('prefers the name the member goes by', () => {
		const [entry] = toLeaderboard({
			entries: [
				{
					rank: 1,
					userId: '111111111111111111',
					username: 'alice',
					globalName: 'Alice',
					avatarHash: null,
					xp: 900,
					level: 3,
					totalMessages: 40
				}
			],
			members: 1
		});

		expect(entry?.name).toBe('Alice');
	});

	it('falls back to the username, then to the id, rather than showing a blank', () => {
		const board = toLeaderboard({
			entries: [
				{
					rank: 1,
					userId: '111111111111111111',
					username: 'alice',
					globalName: null,
					avatarHash: null,
					xp: 9,
					level: 0,
					totalMessages: 1
				},
				{
					rank: 2,
					userId: '222222222222222222',
					username: null,
					globalName: null,
					avatarHash: null,
					xp: 8,
					level: 0,
					totalMessages: 1
				}
			],
			members: 2
		});

		expect(board.map((entry) => entry.name)).toEqual(['alice', '222222222222222222']);
	});

	it('gives an empty board an empty list rather than a row of nothing', () => {
		expect(toLeaderboard({ entries: [], members: 0 })).toEqual([]);
	});

	it('gives the same member the same colour every time', () => {
		expect(colourFor('111111111111111111')).toBe(colourFor('111111111111111111'));
	});

	it('always has a colour, even for an id with no digits at the end', () => {
		expect(colourFor('')).toMatch(/^#[0-9a-f]{6}$/);
	});
});

describe('rewardId', () => {
	it('is the same for the same level and role', () => {
		expect(rewardId({ level: 5, roleId: NOVICE })).toBe(rewardId({ level: 5, roleId: NOVICE }));
	});

	it('differs when the level differs', () => {
		expect(rewardId({ level: 5, roleId: NOVICE })).not.toBe(rewardId({ level: 6, roleId: NOVICE }));
	});
});

describe('levelVariables', () => {
	it('offers only the tokens the bot really replaces', () => {
		expect(levelVariables('Pixel Foundry').map((variable) => variable.token)).toEqual([
			'{user}',
			'{user.mention}',
			'{level}',
			'{server}'
		]);
	});

	it('shows the real server name in the sample', () => {
		expect(levelVariables('Pixel Foundry').at(-1)?.sample).toBe('Pixel Foundry');
	});
});
