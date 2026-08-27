import { describe, expect, it } from 'vitest';
import { guildIconUrl, userAvatarUrl } from './discord-cdn';

describe('guildIconUrl', () => {
	it('builds a png url for a static icon', () => {
		expect(guildIconUrl('842315097461823104', 'abc123')).toBe(
			'https://cdn.discordapp.com/icons/842315097461823104/abc123.png?size=128'
		);
	});

	it('asks for a gif when the hash says the icon is animated', () => {
		expect(guildIconUrl('842315097461823104', 'a_abc123')).toContain('.gif');
	});

	it('answers null when the guild has no icon', () => {
		expect(guildIconUrl('842315097461823104', null)).toBeNull();
		expect(guildIconUrl('842315097461823104', '')).toBeNull();
	});

	it('honours a requested size', () => {
		expect(guildIconUrl('1', 'abc', 256)).toContain('size=256');
	});
});

describe('userAvatarUrl', () => {
	it('points at the avatars path, not icons', () => {
		expect(userAvatarUrl('393199508785201152', 'def456')).toBe(
			'https://cdn.discordapp.com/avatars/393199508785201152/def456.png?size=64'
		);
	});

	it('answers null for a user on the default avatar', () => {
		expect(userAvatarUrl('393199508785201152', null)).toBeNull();
	});
});
