import type { CapabilityCatalogDto, TeamSeatDto, TeamSeatSource } from '@/lib/api-url';
import { userAvatarUrl } from '@/lib/discord-cdn';
import { colorOf, initialsOf } from '@/lib/guild-presentation';
import type { TeamRole } from '@/lib/types/management';

export const MANAGE_TEAM = 'team.manage';

const SNOWFLAKE = /^\d{17,20}$/;

export function isSnowflake(value: string): boolean {
	return SNOWFLAKE.test(value.trim());
}

export type TeamMemberView = {
	id: string;
	name: string;
	handle: string;
	initials: string;
	color: string;
	avatarUrl: string | null;
	role: TeamRole;
	source: TeamSeatSource;
	grantedBy: string | null;
	grantedAt: string | null;
	lastSeenAt: string | null;
};

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

export function toTeamMember(seat: TeamSeatDto): TeamMemberView {
	const name = seat.globalName ?? seat.username;

	return {
		id: seat.userId,
		name,
		handle: seat.username === seat.userId ? seat.userId : `@${seat.username}`,
		initials: initialsOf(name),
		color: colorOf(seat.userId),
		avatarUrl: userAvatarUrl(seat.userId, seat.avatarHash),
		role: seat.role,
		source: seat.source,
		grantedBy: seat.grantedBy,
		grantedAt: seat.grantedAt,
		lastSeenAt: seat.lastSeenAt
	};
}

export function isFixedSeat(member: TeamMemberView, viewerId: string): boolean {
	return member.source === 'guild-owner' || member.id === viewerId;
}
