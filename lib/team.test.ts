import { describe, expect, it } from 'vitest';
import { assignableRoles, can, grantedCount, PERMISSIONS, ROLE_ORDER } from '@/lib/team';

describe('can', () => {
	it('gives the owner every permission there is', () => {
		expect(PERMISSIONS.every((permission) => can('owner', permission))).toBe(true);
	});

	it('stops an admin short of billing', () => {
		expect(can('admin', 'team')).toBe(true);
		expect(can('admin', 'billing')).toBe(false);
	});

	it('lets a moderator act on members but not configure modules', () => {
		expect(can('moderator', 'moderate')).toBe(true);
		expect(can('moderator', 'modules')).toBe(false);
	});

	it('leaves a viewer able only to look', () => {
		expect(can('viewer', 'view')).toBe(true);
		expect(can('viewer', 'moderate')).toBe(false);
	});

	it('is false for a permission that does not exist', () => {
		expect(can('owner', 'launch-missiles')).toBe(false);
	});
});

describe('grantedCount', () => {
	it('never gives a lower seat more than the one above it', () => {
		const counts = ROLE_ORDER.map((role) => grantedCount(role));
		const sorted = [...counts].sort((a, b) => b - a);
		expect(counts).toEqual(sorted);
	});
});

describe('assignableRoles', () => {
	it('keeps the owner seat out of the list — it comes from Discord', () => {
		expect(assignableRoles('owner')).not.toContain('owner');
	});

	it('gives nothing to a seat that cannot manage the team', () => {
		expect(assignableRoles('moderator')).toEqual([]);
		expect(assignableRoles('viewer')).toEqual([]);
	});

	it('lets an admin hand out the three lower seats', () => {
		expect(assignableRoles('admin')).toEqual(['admin', 'moderator', 'viewer']);
	});
});
