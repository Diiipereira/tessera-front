import type {
	BlacklistEntry,
	BlacklistTargetType,
	TenantStatus,
	TenantSummary
} from '@/lib/types/admin';
import type { PlanTier } from '@/lib/types/billing';
import { hasPassed } from '@/lib/time';

export const TENANT_SORTS = ['recent', 'name', 'members'] as const;

export type TenantSort = (typeof TENANT_SORTS)[number];

export const TENANT_SORT_LABELS: Record<TenantSort, string> = {
	recent: 'Newest first',
	name: 'Name',
	members: 'Members'
};

export type TenantFilters = {
	query: string;
	status: TenantStatus | 'all';
	plan: PlanTier | 'all';
	sort: TenantSort;
};

export function tenantStatus(tenant: TenantSummary): TenantStatus {
	return tenant.leftAt === null ? 'active' : 'left';
}

export function matchesTenant(tenant: TenantSummary, term: string): boolean {
	if (term === '') return true;

	return (
		tenant.name.toLowerCase().includes(term) ||
		tenant.id.includes(term) ||
		tenant.ownerName.toLowerCase().includes(term) ||
		tenant.ownerId.includes(term)
	);
}

export function filterTenants(tenants: TenantSummary[], filters: TenantFilters): TenantSummary[] {
	const term = filters.query.trim().toLowerCase();

	const matched = tenants.filter((tenant) => {
		if (filters.status !== 'all' && tenantStatus(tenant) !== filters.status) return false;
		if (filters.plan !== 'all' && tenant.planKey !== filters.plan) return false;
		return matchesTenant(tenant, term);
	});

	return [...matched].sort((a, b) => {
		if (filters.sort === 'name') return a.name.localeCompare(b.name);
		if (filters.sort === 'members') return b.memberCount - a.memberCount;
		return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
	});
}

export function countByPlan(tenants: TenantSummary[]): Record<PlanTier, number> {
	const counts: Record<PlanTier, number> = { free: 0, pro: 0, ultimate: 0 };

	for (const tenant of tenants) {
		if (tenantStatus(tenant) === 'active') counts[tenant.planKey] += 1;
	}

	return counts;
}

export function formatMembers(count: number): string {
	if (count < 1000) return String(count);
	if (count < 1_000_000) return `${(count / 1000).toFixed(count < 10_000 ? 1 : 0)}k`;
	return `${(count / 1_000_000).toFixed(1)}M`;
}

export function isExpired(entry: BlacklistEntry, now?: Date): boolean {
	return hasPassed(entry.expiresAt, now);
}

export function activeBlacklist(entries: BlacklistEntry[], now?: Date): BlacklistEntry[] {
	return entries.filter((entry) => !isExpired(entry, now));
}

export type BlacklistFilters = {
	query: string;
	targetType: BlacklistTargetType | 'all';
	includeExpired: boolean;
};

export function filterBlacklist(
	entries: BlacklistEntry[],
	filters: BlacklistFilters,
	now?: Date
): BlacklistEntry[] {
	const term = filters.query.trim().toLowerCase();

	return entries.filter((entry) => {
		if (filters.targetType !== 'all' && entry.targetType !== filters.targetType) return false;
		if (!filters.includeExpired && isExpired(entry, now)) return false;
		if (term === '') return true;

		return (
			entry.name.toLowerCase().includes(term) ||
			entry.targetId.includes(term) ||
			(entry.reason ?? '').toLowerCase().includes(term)
		);
	});
}

export function toPlanFilter(value: string): PlanTier | 'all' {
	if (value === 'free' || value === 'pro' || value === 'ultimate') return value;
	return 'all';
}

export function toTenantSort(value: string): TenantSort {
	if (value === 'name' || value === 'members') return value;
	return 'recent';
}

export function toTargetFilter(value: string): BlacklistTargetType | 'all' {
	if (value === 'user' || value === 'guild') return value;
	return 'all';
}

const SNOWFLAKE = /^[0-9]{17,20}$/;

export function isSnowflake(value: string): boolean {
	return SNOWFLAKE.test(value.trim());
}
