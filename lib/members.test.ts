import { describe, expect, it } from 'vitest';
import { filterMembers, sortMembers, warningCount } from '@/lib/members';
import type { Member } from '@/lib/types/management';

function member(partial: Partial<Member>): Member {
	return {
		id: '1',
		name: 'tigre',
		handle: '@tigre',
		initials: 'T',
		color: '#fff',
		joinedAt: '2025-01-01T00:00:00.000Z',
		lastSeenAt: '2026-08-25T00:00:00.000Z',
		level: 10,
		xp: 1000,
		balance: 100,
		messages: 500,
		standing: 'clean',
		roleIds: [],
		infractions: [],
		notes: [],
		...partial
	};
}

describe('warningCount', () => {
	it('counts only warnings, not every infraction', () => {
		const entry = member({
			infractions: [
				{ id: '1', caseNumber: 1, action: 'warn', reason: '', moderator: 'o', at: '' },
				{ id: '2', caseNumber: 2, action: 'ban', reason: '', moderator: 'o', at: '' },
				{ id: '3', caseNumber: 3, action: 'warn', reason: '', moderator: 'o', at: '' }
			]
		});
		expect(warningCount(entry)).toBe(2);
	});
});

describe('filterMembers', () => {
	const members = [
		member({ id: '1', name: 'lia', handle: '@lia.exe', roleIds: ['r1'] }),
		member({ id: '2', name: 'okra', handle: '@okra', standing: 'warned' }),
		member({ id: '999888777', name: 'corvo', handle: '@corvo', roleIds: ['r1', 'r2'] })
	];

	const base = { query: '', roleId: 'all', standing: 'all' } as const;

	it('matches on the handle as well as the name', () => {
		const found = filterMembers(members, { ...base, query: 'exe' });
		expect(found.map((entry) => entry.id)).toEqual(['1']);
	});

	it('matches on a partial snowflake, which is how staff paste IDs', () => {
		const found = filterMembers(members, { ...base, query: '9998' });
		expect(found.map((entry) => entry.id)).toEqual(['999888777']);
	});

	it('narrows by role', () => {
		expect(filterMembers(members, { ...base, roleId: 'r1' })).toHaveLength(2);
	});

	it('narrows by standing', () => {
		const found = filterMembers(members, { ...base, standing: 'warned' });
		expect(found.map((entry) => entry.id)).toEqual(['2']);
	});
});

describe('sortMembers', () => {
	const members = [
		member({ id: 'a', name: 'zeta', level: 5, balance: 900, joinedAt: '2025-01-01T00:00:00.000Z' }),
		member({
			id: 'b',
			name: 'alpha',
			level: 20,
			balance: 10,
			joinedAt: '2026-01-01T00:00:00.000Z'
		}),
		member({ id: 'c', name: 'mid', level: 12, balance: 500, joinedAt: '2024-01-01T00:00:00.000Z' })
	];

	it('puts the newest join first', () => {
		expect(sortMembers(members, 'joined').map((entry) => entry.id)).toEqual(['b', 'a', 'c']);
	});

	it('puts the highest level first', () => {
		expect(sortMembers(members, 'level').map((entry) => entry.id)).toEqual(['b', 'c', 'a']);
	});

	it('puts the richest first', () => {
		expect(sortMembers(members, 'balance').map((entry) => entry.id)).toEqual(['a', 'c', 'b']);
	});

	it('sorts names alphabetically', () => {
		expect(sortMembers(members, 'name').map((entry) => entry.id)).toEqual(['b', 'c', 'a']);
	});

	it('does not mutate the array it was given', () => {
		const original = [...members];
		sortMembers(members, 'level');
		expect(members).toEqual(original);
	});

	it('breaks a level tie on XP', () => {
		const tied = [member({ id: 'x', level: 7, xp: 100 }), member({ id: 'y', level: 7, xp: 900 })];
		expect(sortMembers(tied, 'level').map((entry) => entry.id)).toEqual(['y', 'x']);
	});
});
