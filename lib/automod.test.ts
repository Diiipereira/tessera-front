import { describe, expect, it } from 'vitest';
import { describeTrigger, evaluateMessage, untestableTriggers } from './automod';
import type { AutoModRule, AutoModTrigger } from './types/module-configs';

function rule(trigger: AutoModTrigger, overrides: Partial<AutoModRule> = {}): AutoModRule {
	return {
		id: trigger,
		name: trigger,
		trigger,
		threshold: 1,
		windowSeconds: 5,
		actions: ['delete'],
		exemptRoleIds: [],
		exemptChannelIds: [],
		words: [],
		enabled: true,
		...overrides
	};
}

describe('evaluateMessage', () => {
	it('catches a Discord invite', () => {
		const hits = evaluateMessage('join discord.gg/abc123', [rule('invites')]);
		expect(hits).toHaveLength(1);
		expect(hits[0]?.reason).toContain('invite');
	});

	it('catches the discord.com/invite spelling too', () => {
		expect(evaluateMessage('discord.com/invite/xyz', [rule('invites')])).toHaveLength(1);
	});

	it('does not treat an ordinary link as an invite', () => {
		expect(evaluateMessage('https://example.com/page', [rule('invites')])).toHaveLength(0);
	});

	it('counts mentions against the threshold', () => {
		const r = rule('mentions', { threshold: 3 });
		expect(evaluateMessage('<@1> <@2>', [r])).toHaveLength(0);
		expect(evaluateMessage('<@1> <@2> <@3>', [r])).toHaveLength(1);
	});

	it('treats @everyone as a mention', () => {
		expect(evaluateMessage('@everyone', [rule('mentions', { threshold: 1 })])).toHaveLength(1);
	});

	it('fires on capitals only above the configured share', () => {
		const r = rule('caps', { threshold: 70 });
		expect(evaluateMessage('THIS IS ALL SHOUTING', [r])).toHaveLength(1);
		expect(evaluateMessage('this is quiet enough', [r])).toHaveLength(0);
	});

	it('ignores a very short message that happens to be capitals', () => {
		expect(evaluateMessage('OK', [rule('caps', { threshold: 70 })])).toHaveLength(0);
	});

	it('matches blocked words regardless of case', () => {
		const hits = evaluateMessage('free NITRO here', [rule('words', { words: ['nitro'] })]);
		expect(hits).toHaveLength(1);
		expect(hits[0]?.reason).toContain('nitro');
	});

	it('ignores empty entries in the blocklist', () => {
		expect(evaluateMessage('anything', [rule('words', { words: ['', '  '] })])).toHaveLength(0);
	});

	it('skips rules that are switched off', () => {
		expect(evaluateMessage('discord.gg/abc', [rule('invites', { enabled: false })])).toHaveLength(
			0
		);
	});

	it('reports every rule that would fire, not just the first', () => {
		const hits = evaluateMessage('CHECK THIS OUT NOW discord.gg/x @everyone', [
			rule('invites'),
			rule('mentions', { threshold: 1 }),
			rule('caps', { threshold: 40 })
		]);
		expect(hits.map((hit) => hit.rule.trigger).sort()).toEqual(['caps', 'invites', 'mentions']);
	});

	it('finds nothing in an innocent message', () => {
		const hits = evaluateMessage('good morning everyone, how is it going', [
			rule('invites'),
			rule('links'),
			rule('mentions', { threshold: 4 }),
			rule('caps', { threshold: 70 })
		]);
		expect(hits).toEqual([]);
	});
});

describe('untestableTriggers', () => {
	it('flags triggers a single message cannot demonstrate', () => {
		const flagged = untestableTriggers([rule('spam'), rule('invites'), rule('attachments')]);
		expect(flagged.map((entry) => entry.trigger)).toEqual(['spam', 'attachments']);
	});

	it('ignores disabled rules', () => {
		expect(untestableTriggers([rule('spam', { enabled: false })])).toEqual([]);
	});
});

describe('describeTrigger', () => {
	it('spells out the spam window', () => {
		expect(describeTrigger('spam', rule('spam', { threshold: 5, windowSeconds: 10 }))).toBe(
			'5 messages in 10s'
		);
	});

	it('counts the blocklist', () => {
		expect(describeTrigger('words', rule('words', { words: ['a', 'b'] }))).toBe('2 blocked words');
	});

	it('has wording for every trigger', () => {
		const triggers: AutoModTrigger[] = [
			'spam',
			'invites',
			'links',
			'caps',
			'mentions',
			'words',
			'attachments'
		];
		for (const trigger of triggers) {
			expect(describeTrigger(trigger, rule(trigger))).not.toBe('');
		}
	});
});
