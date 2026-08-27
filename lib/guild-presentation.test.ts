import { describe, expect, it } from 'vitest';
import type { GuildCardDto } from './api-url';
import { colorOf, initialsOf, tierOf, toGuild } from './guild-presentation';

const dto: GuildCardDto = {
	id: '842315097461823104',
	name: 'Pixel Foundry',
	iconHash: null,
	owner: true,
	memberCount: 12431,
	planKey: 'pro'
};

describe('initialsOf', () => {
	it('takes the first letter of the first two words', () => {
		expect(initialsOf('Pixel Foundry')).toBe('PF');
	});

	it('takes two letters when the name is a single word', () => {
		expect(initialsOf('Speedrun')).toBe('SP');
	});

	it('ignores the words past the second', () => {
		expect(initialsOf('Fórum dos Devs')).toBe('FD');
	});

	it('survives padding and repeated spaces', () => {
		expect(initialsOf('  Late   Night  ')).toBe('LN');
	});

	it('gives something rather than crashing on an empty name', () => {
		expect(initialsOf('   ')).toBe('??');
	});
});

describe('colorOf', () => {
	it('is stable for the same id, so a server does not change colour on reload', () => {
		expect(colorOf('842315097461823104')).toBe(colorOf('842315097461823104'));
	});

	it('always answers a hex colour', () => {
		for (const id of ['1', '842315097461823104', '999999999999999999']) {
			expect(colorOf(id)).toMatch(/^#[0-9a-f]{6}$/);
		}
	});

	it('separates different ids most of the time', () => {
		const ids = Array.from({ length: 10 }, (_, index) => `84231509746182310${String(index)}`);
		expect(new Set(ids.map(colorOf)).size).toBeGreaterThan(1);
	});
});

describe('tierOf', () => {
	it('passes the paid plans through', () => {
		expect(tierOf('pro')).toBe('pro');
		expect(tierOf('ultimate')).toBe('ultimate');
	});

	it('falls back to free for null, which is a guild without the bot', () => {
		expect(tierOf(null)).toBe('free');
	});

	it('falls back to free for a plan key the dashboard does not know', () => {
		expect(tierOf('enterprise')).toBe('free');
	});
});

describe('toGuild', () => {
	it('carries the stored member count for an installed guild', () => {
		expect(toGuild(dto, true)).toMatchObject({
			id: '842315097461823104',
			name: 'Pixel Foundry',
			initials: 'PF',
			memberCount: 12431,
			hasBot: true,
			tier: 'pro'
		});
	});

	it('does not invent a member count when the API has none', () => {
		const guild = toGuild({ ...dto, memberCount: null, planKey: null }, false);

		expect(guild.memberCount).toBe(0);
		expect(guild.hasBot).toBe(false);
		expect(guild.tier).toBe('free');
	});
});
