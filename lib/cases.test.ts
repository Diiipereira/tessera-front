import { describe, expect, it } from 'vitest';
import { caseStatus, filterCases, relatedCases } from '@/lib/cases';
import type { ModerationCase } from '@/lib/types/management';

const NOW = new Date('2026-08-25T18:30:00.000Z');

function makeCase(partial: Partial<ModerationCase>): ModerationCase {
	return {
		id: 'c',
		number: 1,
		action: 'warn',
		targetId: 'u1',
		targetName: 'tigre',
		targetInitials: 'T',
		targetColor: '#fff',
		moderatorName: 'okra',
		moderatorInitials: 'O',
		moderatorColor: '#fff',
		reason: 'Arguing with staff.',
		createdAt: '2026-08-01T00:00:00.000Z',
		expiresAt: null,
		revoked: false,
		evidence: [],
		history: [],
		...partial
	};
}

describe('caseStatus', () => {
	it('calls a permanent punishment active', () => {
		expect(caseStatus(makeCase({ expiresAt: null }), NOW)).toBe('active');
	});

	it('calls a punishment past its expiry expired', () => {
		expect(caseStatus(makeCase({ expiresAt: '2026-08-24T00:00:00.000Z' }), NOW)).toBe('expired');
	});

	it('keeps a punishment active while it still has time', () => {
		expect(caseStatus(makeCase({ expiresAt: '2026-08-26T00:00:00.000Z' }), NOW)).toBe('active');
	});

	it('lets revoked win over an expiry that has not been reached', () => {
		const entry = makeCase({ revoked: true, expiresAt: '2026-08-26T00:00:00.000Z' });
		expect(caseStatus(entry, NOW)).toBe('revoked');
	});
});

describe('filterCases', () => {
	const cases = [
		makeCase({ id: '1', number: 41, action: 'warn', moderatorName: 'brisa' }),
		makeCase({ id: '2', number: 42, action: 'ban', targetName: 'ruido', revoked: true }),
		makeCase({ id: '3', number: 43, action: 'warn', reason: 'Spoilers in general.' })
	];

	const base = { query: '', action: 'all', status: 'all', moderator: 'all' } as const;

	it('finds a case by its number with the hash typed', () => {
		const found = filterCases(cases, { ...base, query: '#42' }, NOW);
		expect(found.map((entry) => entry.id)).toEqual(['2']);
	});

	it('searches the reason text', () => {
		const found = filterCases(cases, { ...base, query: 'spoilers' }, NOW);
		expect(found.map((entry) => entry.id)).toEqual(['3']);
	});

	it('narrows by action', () => {
		expect(filterCases(cases, { ...base, action: 'warn' }, NOW)).toHaveLength(2);
	});

	it('narrows by derived status, not a stored one', () => {
		const found = filterCases(cases, { ...base, status: 'revoked' }, NOW);
		expect(found.map((entry) => entry.id)).toEqual(['2']);
	});

	it('narrows by moderator', () => {
		expect(filterCases(cases, { ...base, moderator: 'brisa' }, NOW)).toHaveLength(1);
	});
});

describe('relatedCases', () => {
	it('gathers the other cases for the same member', () => {
		const first = makeCase({ id: '1', targetId: 'u1' });
		const second = makeCase({ id: '2', targetId: 'u1' });
		const other = makeCase({ id: '3', targetId: 'u2' });

		const related = relatedCases([first, second, other], first);
		expect(related.map((entry) => entry.id)).toEqual(['2']);
	});
});
