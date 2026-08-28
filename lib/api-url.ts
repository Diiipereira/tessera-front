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
	config: Record<string, unknown>;
	version: number;
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

export type InviteDto = {
	id: string;
	url: string;
	role: TeamRole;
	createdBy: string | null;
	createdAt: string;
	expiresAt: string;
};

export type InviteListDto = {
	invites: InviteDto[];
};

export type InviteState = 'open' | 'used' | 'revoked' | 'expired';

export type InvitePreviewDto = {
	guildId: string;
	guildName: string;
	role: TeamRole;
	state: InviteState;
};

export type InviteAcceptedDto = {
	guildId: string;
	role: TeamRole;
	alreadyHadAccess: boolean;
};
