import type {
	BlacklistEntryDto,
	TenantDetailDto,
	TenantStaffDto,
	TenantSummaryDto
} from '@/lib/api-url';
import { colorOf, initialsOf, tierOf } from '@/lib/guild-presentation';
import { MODULE_IDS, type ModuleId } from '@/lib/types/modules';
import type {
	AccessSource,
	BlacklistEntry,
	BlacklistTargetType,
	DashboardRole,
	SubscriptionStatus,
	TenantDetail,
	TenantStaffMember,
	TenantSummary
} from '@/lib/types/admin';

const UNKNOWN_AUTHOR = '—';

const ROLES: DashboardRole[] = ['owner', 'admin', 'moderator', 'viewer'];

const SOURCES: AccessSource[] = [
	'guild-owner',
	'guild-staff',
	'platform-staff',
	'discord-permission'
];

const STATUSES: SubscriptionStatus[] = ['active', 'trialing', 'past_due', 'canceled', 'expired'];

const TARGETS: BlacklistTargetType[] = ['user', 'guild'];

const roleOf = (value: string): DashboardRole => ROLES.find((role) => role === value) ?? 'viewer';

const sourceOf = (value: string): AccessSource =>
	SOURCES.find((source) => source === value) ?? 'guild-staff';

const statusOf = (value: string): SubscriptionStatus =>
	STATUSES.find((status) => status === value) ?? 'expired';

const isModuleId = (value: string): value is ModuleId => MODULE_IDS.some((id) => id === value);

const isTargetType = (value: string): value is BlacklistTargetType =>
	TARGETS.some((target) => target === value);

export function toTenantSummary(dto: TenantSummaryDto): TenantSummary {
	return {
		id: dto.id,
		name: dto.name,
		initials: initialsOf(dto.name),
		color: colorOf(dto.id),
		ownerId: dto.ownerId,
		ownerName: dto.ownerName ?? dto.ownerId,
		memberCount: dto.memberCount,
		planKey: tierOf(dto.planKey),
		locale: dto.locale,
		setupCompleted: dto.setupCompleted,
		joinedAt: dto.joinedAt,
		leftAt: dto.leftAt
	};
}

const toStaffMember = (dto: TenantStaffDto): TenantStaffMember => ({
	userId: dto.userId,
	name: dto.name,
	initials: initialsOf(dto.name),
	color: colorOf(dto.userId),
	role: roleOf(dto.role),
	source: sourceOf(dto.source),
	grantedAt: dto.grantedAt
});

export function toTenantDetail(dto: TenantDetailDto): TenantDetail {
	return {
		summary: toTenantSummary(dto.summary),
		modules: dto.modules
			.filter((module) => isModuleId(module.key))
			.map((module) => ({
				key: module.key as ModuleId,
				enabled: module.enabled,
				version: module.version,
				updatedAt: module.updatedAt,
				updatedByName: module.updatedByName
			})),
		staff: dto.staff.map(toStaffMember),
		activity: dto.activity.map((point) => ({
			day: point.day,
			messages: point.messages,
			commands: point.commands,
			joins: point.joins,
			leaves: point.leaves
		})),
		subscription:
			dto.subscription === null
				? null
				: {
						planKey: tierOf(dto.subscription.planKey),
						status: statusOf(dto.subscription.status),
						provider: dto.subscription.provider,
						currentPeriodEnd: dto.subscription.currentPeriodEnd,
						cancelAtPeriodEnd: dto.subscription.cancelAtPeriodEnd
					}
	};
}

export function toBlacklistEntries(entries: BlacklistEntryDto[]): BlacklistEntry[] {
	return entries
		.filter((entry) => isTargetType(entry.targetType))
		.map((entry) => ({
			targetType: entry.targetType as BlacklistTargetType,
			targetId: entry.targetId,
			name: entry.name ?? entry.targetId,
			reason: entry.reason,
			createdByName: entry.createdByName ?? UNKNOWN_AUTHOR,
			createdAt: entry.createdAt,
			expiresAt: entry.expiresAt
		}));
}
