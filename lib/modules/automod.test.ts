import { describe, expect, it } from 'vitest';
import type { GuildModuleStateDto } from '@/lib/api-url';
import type { AutoModRule } from '@/lib/types/module-configs';
import {
	MAX_WORDS,
	cleanWords,
	incomplete,
	testable,
	toAutoModConfig,
	toRulePayload,
	type AutomodRuleDto
} from './automod';

const state = (enabled: boolean): GuildModuleStateDto => ({
	key: 'automod',
	configured: true,
	enabled,
	config: {},
	version: 3
});

const dto = (patch: Partial<AutomodRuleDto> = {}): AutomodRuleDto => ({
	id: 'e6b3e0a2-0000-0000-0000-000000000001',
	name: 'No links',
	trigger: 'links',
	threshold: 1,
	windowSeconds: 10,
	actions: ['delete'],
	exemptRoleIds: [],
	exemptChannelIds: [],
	words: [],
	enabled: true,
	...patch
});

const rule = (patch: Partial<AutoModRule> = {}): AutoModRule => ({
	id: 'rule-local-1',
	name: 'No links',
	trigger: 'links',
	threshold: 1,
	windowSeconds: 10,
	actions: ['delete'],
	exemptRoleIds: [],
	exemptChannelIds: [],
	words: [],
	enabled: true,
	...patch
});

describe('toAutoModConfig', () => {
	it('takes whether the module is on from the module state, not from the rules', () => {
		expect(toAutoModConfig(state(false), [dto()]).enabled).toBe(false);
		expect(toAutoModConfig(state(true), []).enabled).toBe(true);
	});

	it('keeps the id the API assigned, so an edit lands on the right rule', () => {
		const [first] = toAutoModConfig(state(true), [dto()]).rules;

		expect(first?.id).toBe('e6b3e0a2-0000-0000-0000-000000000001');
	});

	it('keeps the order the API answered with, which is the priority order', () => {
		const config = toAutoModConfig(state(true), [
			dto({ id: 'a', name: 'First' }),
			dto({ id: 'b', name: 'Second' })
		]);

		expect(config.rules.map((entry) => entry.name)).toEqual(['First', 'Second']);
	});

	it('copies the lists instead of sharing them with the response', () => {
		const answered = dto({ words: ['one'] });
		const [first] = toAutoModConfig(state(true), [answered]).rules;

		first?.words.push('two');

		expect(answered.words).toEqual(['one']);
	});
});

describe('toRulePayload', () => {
	it('never sends the local id, which the API would refuse', () => {
		const [payload] = toRulePayload([rule()]);

		expect(payload).not.toHaveProperty('id');
	});

	it('trims the name, so a stray space is not what gets stored', () => {
		expect(toRulePayload([rule({ name: '  No links  ' })])[0]?.name).toBe('No links');
	});

	it('drops the blank lines the words textarea leaves behind', () => {
		const [payload] = toRulePayload([rule({ trigger: 'words', words: ['idiota', '', '  '] })]);

		expect(payload?.words).toEqual(['idiota']);
	});

	it('carries the rest of the rule through untouched', () => {
		const [payload] = toRulePayload([
			rule({ trigger: 'caps', threshold: 70, windowSeconds: 30, actions: ['delete', 'warn'] })
		]);

		expect(payload?.trigger).toBe('caps');
		expect(payload?.threshold).toBe(70);
		expect(payload?.windowSeconds).toBe(30);
		expect(payload?.actions).toEqual(['delete', 'warn']);
	});
});

describe('cleanWords', () => {
	it('removes blanks and duplicates, keeping the first spelling', () => {
		expect(cleanWords([' idiota ', 'idiota', '', 'burro'])).toEqual(['idiota', 'burro']);
	});

	it('stops at the number of words a guild may hold', () => {
		const many = Array.from({ length: MAX_WORDS + 10 }, (_, index) => `word${String(index)}`);

		expect(cleanWords(many)).toHaveLength(MAX_WORDS);
	});
});

describe('incomplete', () => {
	it('says a rule with no name is not ready', () => {
		expect(incomplete(rule({ name: '   ' }))).toBe('name');
	});

	it('says a rule with no action is not ready', () => {
		expect(incomplete(rule({ actions: [] }))).toBe('actions');
	});

	it('says a word rule that names no word is not ready', () => {
		expect(incomplete(rule({ trigger: 'words', words: ['  '] }))).toBe('words');
	});

	it('lets a rule that is not about words carry no words', () => {
		expect(incomplete(rule({ trigger: 'links', words: [] }))).toBeNull();
	});
});

describe('testable', () => {
	it('refuses to test while any rule is still half written', () => {
		expect(testable([rule(), rule({ name: '' })])).toBe(false);
	});

	it('tests once every rule is finished', () => {
		expect(testable([rule(), rule({ name: 'Another' })])).toBe(true);
	});

	it('has nothing to object to in an empty list', () => {
		expect(testable([])).toBe(true);
	});
});
