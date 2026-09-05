import type { TeamRole } from '@/lib/types/management';

const FALLBACK_API_URL = 'http://localhost:3001';

export const SESSION_COOKIE = '__Host-session';

export function apiBaseUrl(): string {
	const configured = process.env.NEXT_PUBLIC_API_URL;
	return configured === undefined || configured === '' ? FALLBACK_API_URL : configured;
}

export function signInHref(returnTo: string): string {
	return `${apiBaseUrl()}/auth/discord?returnTo=${encodeURIComponent(returnTo)}`;
}

export type GuildCardDto = {
	id: string;
	name: string;
	iconHash: string | null;
	owner: boolean;
	reachedBySeat: boolean;
	memberCount: number | null;
	planKey: string | null;
	botPermissions: string | null;
};

export type GuildListDto = {
	managed: GuildCardDto[];
	available: GuildCardDto[];
};

export type GuildModuleStateDto = {
	key: string;
	enabled: boolean;
	configured: boolean;
	config: Record<string, unknown>;
	version: number;
};

export type GuildModuleListDto = {
	modules: GuildModuleStateDto[];
};

export type GuildChannelDto = {
	id: string;
	name: string;
	type: number;
	parentId: string | null;
};

export type GuildChannelListDto = {
	channels: GuildChannelDto[];
};

export type GuildRoleDto = {
	id: string;
	name: string;
	color: string;
	managed: boolean;
	everyone: boolean;
};

export type GuildRoleListDto = {
	roles: GuildRoleDto[];
};

export type AuthenticatedUserDto = {
	id: string;
	username: string;
	globalName: string | null;
	avatarHash: string | null;
	locale: string;
	isPlatformStaff: boolean;
};

export type CapabilityDto = {
	key: string;
	label: string;
	description: string;
};

export type CapabilityCatalogDto = {
	capabilities: CapabilityDto[];
	roles: TeamRole[];
	presets: Partial<Record<TeamRole, string[]>>;
};

export type TeamSeatSource = 'guild-owner' | 'guild-staff';

export type TeamSeatDto = {
	userId: string;
	username: string;
	globalName: string | null;
	avatarHash: string | null;
	role: TeamRole;
	source: TeamSeatSource;
	grantedBy: string | null;
	grantedAt: string | null;
	lastSeenAt: string | null;
};

export type TeamListDto = {
	seats: TeamSeatDto[];
	viewerId: string;
	viewerRole: TeamRole;
};

export type TenantSummaryDto = {
	id: string;
	name: string;
	iconHash: string | null;
	ownerId: string;
	ownerName: string | null;
	memberCount: number;
	planKey: string;
	locale: string;
	setupCompleted: boolean;
	joinedAt: string;
	leftAt: string | null;
};

export type TenantModuleDto = {
	key: string;
	enabled: boolean;
	version: number;
	updatedAt: string | null;
	updatedByName: string | null;
};

export type TenantStaffDto = {
	userId: string;
	name: string;
	avatarHash: string | null;
	role: string;
	source: string;
	grantedAt: string | null;
};

export type TenantDailyDto = {
	day: string;
	messages: number;
	commands: number;
	joins: number;
	leaves: number;
};

export type TenantSubscriptionDto = {
	planKey: string;
	status: string;
	provider: string;
	currentPeriodEnd: string | null;
	cancelAtPeriodEnd: boolean;
};

export type TenantDetailDto = {
	summary: TenantSummaryDto;
	modules: TenantModuleDto[];
	staff: TenantStaffDto[];
	activity: TenantDailyDto[];
	subscription: TenantSubscriptionDto | null;
};

export type BlacklistEntryDto = {
	targetType: string;
	targetId: string;
	name: string | null;
	reason: string | null;
	createdByName: string | null;
	createdAt: string;
	expiresAt: string | null;
};
