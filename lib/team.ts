import type { TeamRole } from '@/lib/types/management';

export const PERMISSIONS = ['view', 'moderate', 'cases', 'modules', 'team', 'billing'] as const;

export const ROLE_ORDER: TeamRole[] = ['owner', 'admin', 'moderator', 'viewer'];

const GRANTS: Record<TeamRole, string[]> = {
	owner: [...PERMISSIONS],
	admin: ['view', 'moderate', 'cases', 'modules', 'team'],
	moderator: ['view', 'moderate', 'cases'],
	viewer: ['view']
};

export function can(role: TeamRole, permission: string): boolean {
	return GRANTS[role].includes(permission);
}

export function grantedCount(role: TeamRole): number {
	return GRANTS[role].length;
}

export function assignableRoles(actor: TeamRole): TeamRole[] {
	if (!can(actor, 'team')) return [];
	return ['admin', 'moderator', 'viewer'];
}
