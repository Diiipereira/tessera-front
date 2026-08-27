import type { PlanTier } from './billing';

export type DashboardRole = 'owner' | 'admin' | 'moderator' | 'viewer';

export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired';

export type TenantStatus = 'active' | 'left';

export type TenantSummary = {
	id: string;
	name: string;
	initials: string;
	color: string;
	ownerId: string;
	ownerName: string;
	memberCount: number;
	planKey: PlanTier;
	locale: string;
	setupCompleted: boolean;
	joinedAt: string;
	leftAt: string | null;
};

export type TenantModuleState = {
	key: string;
	label: string;
	enabled: boolean;
	version: number;
	updatedAt: string | null;
	updatedByName: string | null;
};

export type AccessSource = 'guild-owner' | 'guild-staff' | 'platform-staff' | 'discord-permission';

export type TenantStaffMember = {
	userId: string;
	name: string;
	initials: string;
	color: string;
	role: DashboardRole;
	source: AccessSource;
	grantedAt: string | null;
};

export type TenantDailyPoint = {
	day: string;
	messages: number;
	commands: number;
	joins: number;
	leaves: number;
};

export type TenantSubscription = {
	planKey: PlanTier;
	status: SubscriptionStatus;
	provider: string;
	currentPeriodEnd: string | null;
	cancelAtPeriodEnd: boolean;
};

export type TenantDetail = {
	summary: TenantSummary;
	modules: TenantModuleState[];
	staff: TenantStaffMember[];
	activity: TenantDailyPoint[];
	subscription: TenantSubscription | null;
};

export type BlacklistTargetType = 'user' | 'guild';

export type BlacklistEntry = {
	targetType: BlacklistTargetType;
	targetId: string;
	name: string;
	reason: string | null;
	createdByName: string;
	createdAt: string;
	expiresAt: string | null;
};
