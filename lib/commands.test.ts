import { describe, expect, it } from 'vitest';
import { categoryCounts, cooldownLabel, filterCommands, restrictionSummary } from '@/lib/commands';
import type { Channel, Role } from '@/lib/types/discord';
import type { BotCommand } from '@/lib/types/management';

const roles: Role[] = [
	{ id: 'r1', name: 'Staff', color: '#fff', memberCount: 10 },
	{ id: 'r2', name: 'Admin', color: '#fff', memberCount: 3 }
];

const channels: Channel[] = [
	{ id: 'c1', name: 'general', category: 'Community', kind: 'text' },
	{ id: 'c2', name: 'announcements', category: 'Community', kind: 'announcement' }
];

function command(partial: Partial<BotCommand>): BotCommand {
	return {
		id: 'x',
		name: 'ping',
		category: 'Utility',
		description: 'Gateway latency.',
		module: null,
		enabled: true,
		cooldownSeconds: 0,
		uses7d: 0,
		allowedRoleIds: [],
		deniedChannelIds: [],
		...partial
	};
}

describe('cooldownLabel', () => {
	it('says None rather than 0s', () => {
		expect(cooldownLabel(0)).toBe('None');
	});

	it('keeps seconds under a minute', () => {
		expect(cooldownLabel(30)).toBe('30s');
	});

	it('rolls up to minutes and hours', () => {
		expect(cooldownLabel(1800)).toBe('30m');
		expect(cooldownLabel(86400)).toBe('24h');
	});

	it('keeps one decimal rather than lying about a rounded value', () => {
		expect(cooldownLabel(90)).toBe('1.5m');
	});
});

describe('restrictionSummary', () => {
	it('says everyone when nothing is set', () => {
		expect(restrictionSummary(command({}), roles, channels)).toBe('Everyone, everywhere');
	});

	it('names a single allowed role', () => {
		const summary = restrictionSummary(command({ allowedRoleIds: ['r1'] }), roles, channels);
		expect(summary).toBe('Staff');
	});

	it('counts rather than lists once there is more than one role', () => {
		const summary = restrictionSummary(command({ allowedRoleIds: ['r1', 'r2'] }), roles, channels);
		expect(summary).toBe('2 roles');
	});

	it('mentions blocked channels alongside the role rule', () => {
		const summary = restrictionSummary(
			command({ allowedRoleIds: ['r1'], deniedChannelIds: ['c1'] }),
			roles,
			channels
		);
		expect(summary).toBe('Staff, except 1 channel');
	});

	it('ignores a role that no longer exists in the server', () => {
		const summary = restrictionSummary(command({ allowedRoleIds: ['gone'] }), roles, channels);
		expect(summary).toBe('Everyone, everywhere');
	});
});

describe('filterCommands', () => {
	const commands = [
		command({ id: '1', name: 'ban', category: 'Moderation', description: 'Ban a member.' }),
		command({ id: '2', name: 'rank', category: 'Levels', enabled: false }),
		command({ id: '3', name: 'daily', category: 'Economy' })
	];

	const base = { query: '', category: 'all', onlyDisabled: false } as const;

	it('ignores a leading slash the way people type it', () => {
		const found = filterCommands(commands, { ...base, query: '/ban' });
		expect(found.map((entry) => entry.id)).toEqual(['1']);
	});

	it('searches the description too', () => {
		const found = filterCommands(commands, { ...base, query: 'member' });
		expect(found.map((entry) => entry.id)).toEqual(['1']);
	});

	it('narrows by category', () => {
		expect(filterCommands(commands, { ...base, category: 'Levels' })).toHaveLength(1);
	});

	it('shows only the disabled ones when asked', () => {
		const found = filterCommands(commands, { ...base, onlyDisabled: true });
		expect(found.map((entry) => entry.id)).toEqual(['2']);
	});
});

describe('categoryCounts', () => {
	it('reports zero for a category with no commands', () => {
		const counts = categoryCounts([command({ category: 'Moderation' })]);
		expect(counts.Moderation).toBe(1);
		expect(counts.Tickets).toBe(0);
	});
});
