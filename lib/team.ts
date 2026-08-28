import type { CapabilityCatalogDto } from '@/lib/api-url';
import type { TeamRole } from '@/lib/types/management';

export const MANAGE_TEAM = 'team.manage';

export function can(catalog: CapabilityCatalogDto, role: TeamRole, capability: string): boolean {
	return (catalog.presets[role] ?? []).includes(capability);
}

export function grantedCount(catalog: CapabilityCatalogDto, role: TeamRole): number {
	return (catalog.presets[role] ?? []).length;
}

export function assignableRoles(catalog: CapabilityCatalogDto, actor: TeamRole): TeamRole[] {
	if (!can(catalog, actor, MANAGE_TEAM)) return [];

	return catalog.roles.filter((role) => role !== 'owner');
}
