import type { TeamRole } from '@/lib/types/management';

export type Permission = {
	id: string;
	label: string;
	description: string;
};

export const PERMISSIONS: Permission[] = [
	{ id: 'view', label: 'View dashboard', description: 'Read every screen, change nothing.' },
	{ id: 'moderate', label: 'Act on members', description: 'Warn, timeout, kick and ban.' },
	{ id: 'cases', label: 'Edit cases', description: 'Change a reason, revoke a punishment.' },
	{ id: 'modules', label: 'Configure modules', description: 'Every module settings screen.' },
	{ id: 'team', label: 'Manage team', description: 'Grant and revoke dashboard access.' },
	{ id: 'billing', label: 'Manage billing', description: 'Change plan and payment method.' }
];

export const ROLE_LABELS: Record<TeamRole, string> = {
	owner: 'Owner',
	admin: 'Admin',
	moderator: 'Moderator',
	viewer: 'Viewer'
};

export const ROLE_ORDER: TeamRole[] = ['owner', 'admin', 'moderator', 'viewer'];

const GRANTS: Record<TeamRole, string[]> = {
	owner: PERMISSIONS.map((permission) => permission.id),
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
