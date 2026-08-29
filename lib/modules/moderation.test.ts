import { describe, expect, it } from 'vitest';
import type { GuildModuleStateDto } from '@/lib/api-url';
import enUS from '@/messages/en-US.json';
import ptBR from '@/messages/pt-BR.json';
import {
	AUTO_ACTIONS,
	TIMEOUT_KEYS,
	asAutoActions,
	asPurgeDays,
	asTimeoutKey,
	escalationIsUnreachable,
	needsStaffCall,
	toModerationConfig,
	toModerationPatch,
	type ModerationConfig
} from './moderation';

const state = (config: Record<string, unknown> = {}, enabled = true): GuildModuleStateDto => ({
	key: 'moderation',
	enabled,
	config,
	version: 3
});

const config = (over: Partial<ModerationConfig> = {}): ModerationConfig => ({
	...toModerationConfig(state()),
	...over
});

describe('toModerationConfig', () => {
	it('reads an empty row as the declared defaults', () => {
		const read = toModerationConfig(state());

		expect(read.banPurgeDays).toBe(0);
		expect(read.softbanPurgeDays).toBe(1);
		expect(read.timeoutDefault).toBe('1h');
		expect(read.dmOnAction).toBe(true);
		expect(read.requireReason).toBe(false);
	});

	it('keeps the two purge windows apart, which is why there are two fields', () => {
		const read = toModerationConfig(state());

		expect(read.banPurgeDays).not.toBe(read.softbanPurgeDays);
	});

	it('reads what was configured', () => {
		const read = toModerationConfig(
			state({ logChannelId: '111111111111111111', requireReason: true, banPurgeDays: 3 })
		);

		expect(read.logChannelId).toBe('111111111111111111');
		expect(read.requireReason).toBe(true);
		expect(read.banPurgeDays).toBe(3);
	});

	it('survives a row written by an older schema instead of throwing', () => {
		expect(() =>
			toModerationConfig(
				state({ protectedRoleIds: 'not a list', banPurgeDays: 'three', timeoutDefault: 99 })
			)
		).not.toThrow();
	});

	it('carries the module switch from the state, not from the config', () => {
		expect(toModerationConfig(state({}, false)).enabled).toBe(false);
	});
});

describe('asPurgeDays', () => {
	it('keeps a window Discord accepts', () => {
		expect(asPurgeDays(3, 0)).toBe(3);
		expect(asPurgeDays(0, 1)).toBe(0);
		expect(asPurgeDays(7, 0)).toBe(7);
	});

	it('falls back rather than sending Discord something it refuses', () => {
		expect(asPurgeDays(8, 0)).toBe(0);
		expect(asPurgeDays(-1, 1)).toBe(1);
		expect(asPurgeDays(1.5, 0)).toBe(0);
		expect(asPurgeDays('three', 1)).toBe(1);
	});
});

describe('asTimeoutKey', () => {
	it('keeps a duration that is on the list', () => {
		expect(asTimeoutKey('28d')).toBe('28d');
	});

	it('falls back to one that exists', () => {
		expect(asTimeoutKey('99y')).toBe('1h');
		expect(asTimeoutKey(null)).toBe('1h');
	});
});

describe('asAutoActions', () => {
	it('keeps only punishments the engine can apply', () => {
		expect(asAutoActions(['warn', 'unban', 'note', 'ban'])).toEqual(['warn', 'ban']);
	});

	it('keeps them in the declared order, not the stored one', () => {
		expect(asAutoActions(['ban', 'warn'])).toEqual(['warn', 'ban']);
	});

	it('reads anything that is not a list as nothing selected', () => {
		expect(asAutoActions('warn')).toEqual([]);
	});
});

describe('toModerationPatch', () => {
	it('sends an empty text box as absent, so the DM gains no blank line', () => {
		const patch = toModerationPatch(config({ dmExtra: '   ', appealUrl: '' }));

		expect(patch.dmExtra).toBeNull();
		expect(patch.appealUrl).toBeNull();
	});

	it('sends text the owner actually wrote', () => {
		const patch = toModerationPatch(config({ dmExtra: 'Read the rules.' }));

		expect(patch.dmExtra).toBe('Read the rules.');
	});

	it('never sends the module switch inside the config', () => {
		expect(toModerationPatch(config())).not.toHaveProperty('enabled');
	});

	it('sends every declared field, so a cleared one is actually cleared', () => {
		const patch = toModerationPatch(config());

		expect(Object.keys(patch).sort()).toEqual(
			[
				'appealUrl',
				'banPurgeDays',
				'dmExtra',
				'dmOnAction',
				'escalationAutoActions',
				'escalationChannelId',
				'escalationPingRoleIds',
				'logChannelId',
				'mutedRoleId',
				'protectedRoleIds',
				'requireReason',
				'softbanPurgeDays',
				'timeoutDefault'
			].sort()
		);
	});
});

describe('needsStaffCall', () => {
	it('is true while any action still waits on a human', () => {
		expect(needsStaffCall(config({ escalationAutoActions: ['warn'] }))).toBe(true);
	});

	it('is false once the engine does everything itself', () => {
		expect(needsStaffCall(config({ escalationAutoActions: [...AUTO_ACTIONS] }))).toBe(false);
	});

	it('is true when nothing is automatic, which is the default', () => {
		expect(needsStaffCall(config())).toBe(true);
	});
});

describe('escalationIsUnreachable', () => {
	it('catches the case that would silently do nothing at all', () => {
		expect(
			escalationIsUnreachable(
				config({ escalationAutoActions: ['warn'], escalationChannelId: null })
			)
		).toBe(true);
	});

	it('is quiet once there is a channel to ask in', () => {
		expect(
			escalationIsUnreachable(config({ escalationAutoActions: ['warn'], escalationChannelId: '1' }))
		).toBe(false);
	});

	it('is quiet when nothing needs a human', () => {
		expect(
			escalationIsUnreachable(
				config({ escalationAutoActions: [...AUTO_ACTIONS], escalationChannelId: null })
			)
		).toBe(false);
	});
});

describe('the labels the moderation screen asks for', () => {
	const dictionaries = { 'en-US': enUS, 'pt-BR': ptBR };

	const locales = Object.keys(dictionaries) as (keyof typeof dictionaries)[];

	it.each(locales)('names every timeout the screen offers, in %s', (locale) => {
		const labels = dictionaries[locale].durations as Record<string, string | undefined>;
		const missing = TIMEOUT_KEYS.filter((key) => labels[key] === undefined);

		expect(missing).toEqual([]);
	});

	it.each(locales)('names every action the engine can take, in %s', (locale) => {
		const labels = dictionaries[locale].cases.action as Record<string, string | undefined>;
		const missing = AUTO_ACTIONS.filter((action) => labels[action] === undefined);

		expect(missing).toEqual([]);
	});

	it('keeps no duration label the screen never asks for', () => {
		const orphans = Object.keys(enUS.durations).filter(
			(key) => !TIMEOUT_KEYS.some((declared) => declared === key)
		);

		expect(orphans).toEqual([]);
	});

	it('translates the durations rather than repeating the English', () => {
		expect(ptBR.durations['1d']).not.toBe(enUS.durations['1d']);
		expect(ptBR.durations['28d']).not.toBe(enUS.durations['28d']);
	});
});
