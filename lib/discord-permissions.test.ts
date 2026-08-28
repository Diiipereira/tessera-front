import { describe, expect, it } from 'vitest';
import {
	PERMISSION_BITS,
	PERMISSION_NAMES,
	grants,
	permissionMask,
	permissionsExcept
} from './discord-permissions';

const UNDEFINED_BIT = 47n;
const HIGHEST_BIT = 52n;

describe('PERMISSION_BITS', () => {
	it('gives every permission a bit of its own', () => {
		const bits = PERMISSION_NAMES.map((name) => PERMISSION_BITS[name]);

		expect(new Set(bits).size).toBe(bits.length);
	});

	it('leaves the gap Discord left, rather than inventing a permission for it', () => {
		const bits = PERMISSION_NAMES.map((name) => PERMISSION_BITS[name]);

		expect(bits).not.toContain(UNDEFINED_BIT);
	});

	it('covers every bit Discord documents, with no hole but that gap', () => {
		const bits = new Set<bigint>(PERMISSION_NAMES.map((name) => PERMISSION_BITS[name]));
		const uncovered = Array.from({ length: Number(HIGHEST_BIT) + 1 }, (_, index) => BigInt(index))
			.filter((bit) => bit !== UNDEFINED_BIT)
			.filter((bit) => !bits.has(bit));

		expect(uncovered).toEqual([]);
		expect(bits.size).toBe(52);
	});

	it('matches the positions Discord publishes for the ones we lean on', () => {
		expect(PERMISSION_BITS.KICK_MEMBERS).toBe(1n);
		expect(PERMISSION_BITS.BAN_MEMBERS).toBe(2n);
		expect(PERMISSION_BITS.ADMINISTRATOR).toBe(3n);
		expect(PERMISSION_BITS.MANAGE_GUILD).toBe(5n);
		expect(PERMISSION_BITS.MANAGE_ROLES).toBe(28n);
		expect(PERMISSION_BITS.MODERATE_MEMBERS).toBe(40n);
		expect(PERMISSION_BITS.BYPASS_SLOWMODE).toBe(HIGHEST_BIT);
	});
});

describe('permissionMask', () => {
	it('adds one bit per name', () => {
		expect(permissionMask(['CREATE_INSTANT_INVITE'])).toBe(1n);
		expect(permissionMask(['KICK_MEMBERS', 'BAN_MEMBERS'])).toBe(6n);
	});

	it('asks for nothing when given nothing', () => {
		expect(permissionMask([])).toBe(0n);
	});

	it('counts a repeated name once', () => {
		expect(permissionMask(['BAN_MEMBERS', 'BAN_MEMBERS'])).toBe(4n);
	});

	it('stays exact past the range a number could hold, for the bits Discord has yet to define', () => {
		const beyondSafeRange = permissionMask(PERMISSION_NAMES) | (1n << 60n);

		expect(beyondSafeRange).toBeGreaterThan(BigInt(Number.MAX_SAFE_INTEGER));
		expect(beyondSafeRange.toString()).not.toBe(String(Number(beyondSafeRange)));
	});
});

describe('permissionsExcept', () => {
	it('drops exactly the names it is given', () => {
		const kept = permissionsExcept(['ADMINISTRATOR', 'MANAGE_GUILD']);

		expect(kept).not.toContain('ADMINISTRATOR');
		expect(kept).not.toContain('MANAGE_GUILD');
		expect(kept).toHaveLength(PERMISSION_NAMES.length - 2);
	});

	it('keeps the whole table when nothing is refused', () => {
		expect(permissionsExcept([])).toEqual(PERMISSION_NAMES);
	});
});

describe('grants', () => {
	it('reads a single bit out of a mask', () => {
		const mask = permissionMask(['MODERATE_MEMBERS', 'VIEW_CHANNEL']);

		expect(grants(mask, 'MODERATE_MEMBERS')).toBe(true);
		expect(grants(mask, 'VIEW_CHANNEL')).toBe(true);
		expect(grants(mask, 'ADMINISTRATOR')).toBe(false);
	});
});
