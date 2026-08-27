import { describe, expect, it } from 'vitest';
import {
	activeBlacklist,
	countByPlan,
	filterBlacklist,
	filterTenants,
	formatMembers,
	isExpired,
	isSnowflake,
	tenantStatus,
	toPlanFilter,
	toTargetFilter,
	toTenantSort
} from './admin';
import { mockBlacklist, mockTenants } from './mock/admin';
import type { TenantFilters } from './admin';

const base: TenantFilters = { query: '', status: 'all', plan: 'all', sort: 'recent' };

describe('tenantStatus', () => {
	it('reads a null leftAt as an active tenant', () => {
		const tenant = mockTenants.find((entry) => entry.leftAt === null);
		expect(tenant && tenantStatus(tenant)).toBe('active');
	});

	it('reads a filled leftAt as a tenant that is gone', () => {
		const tenant = mockTenants.find((entry) => entry.leftAt !== null);
		expect(tenant && tenantStatus(tenant)).toBe('left');
	});
});

describe('filterTenants', () => {
	it('hides the tenants that left unless asked for them', () => {
		const active = filterTenants(mockTenants, { ...base, status: 'active' });
		expect(active.every((tenant) => tenant.leftAt === null)).toBe(true);
		expect(active.length).toBeLessThan(mockTenants.length);
	});

	it('matches on the guild id, which is what support gets given', () => {
		const found = filterTenants(mockTenants, { ...base, query: '842315097461823104' });
		expect(found).toHaveLength(1);
		expect(found[0]?.name).toBe('Pixel Foundry');
	});

	it('matches on the owner name', () => {
		const found = filterTenants(mockTenants, { ...base, query: 'kaya' });
		expect(found.length).toBeGreaterThan(1);
		expect(found.every((tenant) => tenant.ownerName === 'kaya')).toBe(true);
	});

	it('ignores capitals and padding in the search', () => {
		expect(filterTenants(mockTenants, { ...base, query: '  PIXEL  ' })).toHaveLength(1);
	});

	it('filters by plan', () => {
		const found = filterTenants(mockTenants, { ...base, plan: 'ultimate' });
		expect(found.every((tenant) => tenant.planKey === 'ultimate')).toBe(true);
	});

	it('sorts by member count when asked', () => {
		const found = filterTenants(mockTenants, { ...base, sort: 'members' });
		const counts = found.map((tenant) => tenant.memberCount);
		expect([...counts].sort((a, b) => b - a)).toEqual(counts);
	});

	it('sorts by name when asked', () => {
		const found = filterTenants(mockTenants, { ...base, sort: 'name' });
		const names = found.map((tenant) => tenant.name);
		expect([...names].sort((a, b) => a.localeCompare(b))).toEqual(names);
	});

	it('defaults to newest first', () => {
		const found = filterTenants(mockTenants, base);
		const times = found.map((tenant) => new Date(tenant.joinedAt).getTime());
		expect([...times].sort((a, b) => b - a)).toEqual(times);
	});

	it('leaves the input array untouched', () => {
		const before = mockTenants.map((tenant) => tenant.id);
		filterTenants(mockTenants, { ...base, sort: 'name' });
		expect(mockTenants.map((tenant) => tenant.id)).toEqual(before);
	});
});

describe('countByPlan', () => {
	it('counts only the tenants that are still in', () => {
		const counts = countByPlan(mockTenants);
		const active = mockTenants.filter((tenant) => tenant.leftAt === null);

		expect(counts.free + counts.pro + counts.ultimate).toBe(active.length);
	});
});

describe('formatMembers', () => {
	it('leaves small numbers alone', () => {
		expect(formatMembers(812)).toBe('812');
	});

	it('shortens thousands with one decimal below ten thousand', () => {
		expect(formatMembers(3908)).toBe('3.9k');
	});

	it('drops the decimal above ten thousand', () => {
		expect(formatMembers(27650)).toBe('28k');
	});

	it('shortens millions', () => {
		expect(formatMembers(2_400_000)).toBe('2.4M');
	});
});

describe('blacklist', () => {
	const now = new Date('2026-08-25T18:30:00.000Z');

	it('treats a past expiry as expired', () => {
		const entry = mockBlacklist.find((row) => row.targetId === '918456019283746502');
		expect(entry && isExpired(entry, now)).toBe(true);
	});

	it('treats a null expiry as permanent', () => {
		const entry = mockBlacklist.find((row) => row.expiresAt === null);
		expect(entry && isExpired(entry, now)).toBe(false);
	});

	it('drops the expired entries from the active list', () => {
		expect(activeBlacklist(mockBlacklist, now)).toHaveLength(mockBlacklist.length - 1);
	});

	it('hides expired entries unless asked', () => {
		const visible = filterBlacklist(
			mockBlacklist,
			{ query: '', targetType: 'all', includeExpired: false },
			now
		);
		expect(visible.every((entry) => !isExpired(entry, now))).toBe(true);
	});

	it('shows expired entries when asked', () => {
		const visible = filterBlacklist(
			mockBlacklist,
			{ query: '', targetType: 'all', includeExpired: true },
			now
		);
		expect(visible).toHaveLength(mockBlacklist.length);
	});

	it('filters by target type', () => {
		const visible = filterBlacklist(
			mockBlacklist,
			{ query: '', targetType: 'guild', includeExpired: true },
			now
		);
		expect(visible.every((entry) => entry.targetType === 'guild')).toBe(true);
	});

	it('searches the reason as well as the name', () => {
		const visible = filterBlacklist(
			mockBlacklist,
			{ query: 'phishing', targetType: 'all', includeExpired: true },
			now
		);
		expect(visible).toHaveLength(1);
	});
});

describe('isSnowflake', () => {
	it('accepts a seventeen digit id', () => {
		expect(isSnowflake('12345678901234567')).toBe(true);
	});

	it('accepts surrounding whitespace, which is what pasting produces', () => {
		expect(isSnowflake('  123456789012345678  ')).toBe(true);
	});

	it('rejects anything shorter than seventeen digits', () => {
		expect(isSnowflake('1234567890123456')).toBe(false);
	});

	it('rejects a value with letters in it', () => {
		expect(isSnowflake('12345678901234567a')).toBe(false);
	});
});

describe('select guards', () => {
	it('falls back to all for an unknown plan', () => {
		expect(toPlanFilter('enterprise')).toBe('all');
		expect(toPlanFilter('pro')).toBe('pro');
	});

	it('falls back to recent for an unknown sort', () => {
		expect(toTenantSort('oldest')).toBe('recent');
		expect(toTenantSort('members')).toBe('members');
	});

	it('falls back to all for an unknown target type', () => {
		expect(toTargetFilter('channel')).toBe('all');
		expect(toTargetFilter('user')).toBe('user');
	});
});
