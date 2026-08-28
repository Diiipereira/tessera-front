import { describe, expect, it } from 'vitest';
import type { CapabilityCatalogDto } from '@/lib/api-url';
import { assignableRoles, can, grantedCount, MANAGE_TEAM } from '@/lib/team';

const catalog: CapabilityCatalogDto = {
	capabilities: [
		{ key: 'modules.read', label: 'capabilities.modules.read.label', description: '' },
		{ key: 'modules.write', label: 'capabilities.modules.write.label', description: '' },
		{ key: 'members.moderate', label: 'capabilities.members.moderate.label', description: '' },
		{ key: MANAGE_TEAM, label: 'capabilities.team.manage.label', description: '' },
		{ key: 'billing.manage', label: 'capabilities.billing.manage.label', description: '' }
	],
	roles: ['owner', 'admin', 'moderator', 'viewer'],
	presets: {
		owner: ['modules.read', 'modules.write', 'members.moderate', MANAGE_TEAM, 'billing.manage'],
		admin: ['modules.read', 'modules.write', 'members.moderate', MANAGE_TEAM],
		moderator: ['modules.read', 'members.moderate'],
		viewer: ['modules.read']
	}
};

describe('can', () => {
	it('reads the answer out of the catalogue the API sent', () => {
		expect(can(catalog, 'owner', 'billing.manage')).toBe(true);
		expect(can(catalog, 'admin', 'billing.manage')).toBe(false);
	});

	it('is false for a capability nobody declared, rather than throwing', () => {
		expect(can(catalog, 'owner', 'launch-missiles')).toBe(false);
	});

	it('is false for a role the catalogue never carried', () => {
		const empty = { ...catalog, presets: {} } as unknown as CapabilityCatalogDto;

		expect(can(empty, 'owner', 'modules.read')).toBe(false);
	});
});

describe('grantedCount', () => {
	it('counts what the preset actually holds', () => {
		expect(grantedCount(catalog, 'viewer')).toBe(1);
		expect(grantedCount(catalog, 'owner')).toBe(5);
	});

	it('never gives a lower seat more than the one above it', () => {
		const counts = catalog.roles.map((role) => grantedCount(catalog, role));

		expect(counts).toEqual([...counts].sort((left, right) => right - left));
	});
});

describe('assignableRoles', () => {
	it('keeps the owner seat out of the list, since it comes from Discord', () => {
		expect(assignableRoles(catalog, 'owner')).not.toContain('owner');
	});

	it('gives nothing to a seat that cannot manage the team', () => {
		expect(assignableRoles(catalog, 'moderator')).toEqual([]);
		expect(assignableRoles(catalog, 'viewer')).toEqual([]);
	});

	it('offers every non-owner seat the catalogue knows', () => {
		expect(assignableRoles(catalog, 'admin')).toEqual(['admin', 'moderator', 'viewer']);
	});

	it('follows the catalogue rather than a list of its own', () => {
		const narrowed: CapabilityCatalogDto = { ...catalog, roles: ['owner', 'viewer'] };

		expect(assignableRoles(narrowed, 'admin')).toEqual(['viewer']);
	});
});
