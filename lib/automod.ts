import type { AutoModRule } from '@/lib/types/module-configs';

export type HitReason =
	| { kind: 'invites'; count: number }
	| { kind: 'links'; count: number }
	| { kind: 'mentions'; count: number; limit: number }
	| { kind: 'caps'; ratio: number; limit: number }
	| { kind: 'words'; found: string[] };

export type RuleHit = {
	rule: AutoModRule;
	reason: HitReason;
};

const INVITE = /(discord\.(gg|com\/invite)|discordapp\.com\/invite)\/\S+/gi;
const LINK = /https?:\/\/\S+/gi;
const MENTION = /<@[!&]?\d+>|@everyone|@here/g;

function countMatches(text: string, pattern: RegExp): number {
	return (text.match(pattern) ?? []).length;
}

function capsRatio(text: string): number {
	const letters = text.replace(/[^a-zA-Z]/g, '');
	if (letters.length === 0) return 0;
	const upper = letters.replace(/[^A-Z]/g, '').length;
	return (upper / letters.length) * 100;
}

export function evaluateMessage(text: string, rules: AutoModRule[]): RuleHit[] {
	const hits: RuleHit[] = [];

	for (const rule of rules) {
		if (!rule.enabled) continue;

		if (rule.trigger === 'invites') {
			const count = countMatches(text, INVITE);
			if (count >= Math.max(1, rule.threshold)) {
				hits.push({ rule, reason: { kind: 'invites', count } });
			}
			continue;
		}

		if (rule.trigger === 'links') {
			const count = countMatches(text, LINK);
			if (count >= Math.max(1, rule.threshold)) {
				hits.push({ rule, reason: { kind: 'links', count } });
			}
			continue;
		}

		if (rule.trigger === 'mentions') {
			const count = countMatches(text, MENTION);
			if (count >= rule.threshold) {
				hits.push({ rule, reason: { kind: 'mentions', count, limit: rule.threshold } });
			}
			continue;
		}

		if (rule.trigger === 'caps') {
			const ratio = Math.round(capsRatio(text));
			if (text.length >= 8 && ratio > rule.threshold) {
				hits.push({ rule, reason: { kind: 'caps', ratio, limit: rule.threshold } });
			}
			continue;
		}

		if (rule.trigger === 'words') {
			const lowered = text.toLowerCase();
			const found = rule.words.filter(
				(word) => word !== '' && lowered.includes(word.toLowerCase())
			);
			if (found.length > 0) {
				hits.push({ rule, reason: { kind: 'words', found } });
			}
			continue;
		}
	}

	return hits;
}

export function untestableTriggers(rules: AutoModRule[]): AutoModRule[] {
	return rules.filter(
		(rule) => rule.enabled && (rule.trigger === 'spam' || rule.trigger === 'attachments')
	);
}
