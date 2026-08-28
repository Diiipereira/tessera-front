import { describe, expect, it } from 'vitest';
import { evaluateMessage, untestableTriggers } from './automod';
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
		expect(hits[0]?.reason.kind).toBe('invites');
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
		expect(hits[0]?.reason).toEqual({ kind: 'words', found: ['nitro'] });
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

describe('hit reasons', () => {
	it('reports the counted evidence, not a sentence about it', () => {
		const [hit] = evaluateMessage('discord.gg/a discord.gg/b', [rule('invites')]);

		expect(hit?.reason).toEqual({ kind: 'invites', count: 2 });
	});

	it('carries the limit alongside the count, so either can be shown', () => {
		const [hit] = evaluateMessage('@everyone @here', [rule('mentions', { threshold: 2 })]);

		expect(hit?.reason).toEqual({ kind: 'mentions', count: 2, limit: 2 });
	});

	it('names the words that matched', () => {
		const [hit] = evaluateMessage('this is Spam and junk', [
			rule('words', { words: ['spam', 'junk'] })
		]);

		expect(hit?.reason).toEqual({ kind: 'words', found: ['spam', 'junk'] });
	});

	it('carries no human wording, so a language cannot leak out of here', () => {
		const hits = evaluateMessage('LOOK AT THIS discord.gg/x @everyone', [
			rule('invites'),
			rule('mentions', { threshold: 1 }),
			rule('caps', { threshold: 40 })
		]);

		expect(JSON.stringify(hits.map((hit) => hit.reason))).not.toMatch(
			/found|limit is|capitals|matched/i
		);
	});
});
