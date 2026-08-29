import type { PlanTier } from './billing';
import type { ModerationAction, ModuleId } from './modules';

export type CommandCategory =
	'Moderation' | 'Levels' | 'Economy' | 'Tickets' | 'Community' | 'Utility';

export type BotCommand = {
	id: string;
	name: string;
	category: CommandCategory;
	description: string;
	module: ModuleId | null;
	enabled: boolean;
	cooldownSeconds: number;
	uses7d: number;
	allowedRoleIds: string[];
	deniedChannelIds: string[];
};

export type MemberStanding = 'clean' | 'warned' | 'timed-out' | 'banned';

export type MemberNote = {
	id: string;
	author: string;
	body: string;
	at: string;
};

export type MemberInfraction = {
	id: string;
	caseNumber: number;
	action: ModerationAction;
	reason: string;
	moderator: string;
	at: string;
};

export type Member = {
	id: string;
	name: string;
	handle: string;
	initials: string;
	color: string;
	joinedAt: string;
	lastSeenAt: string;
	level: number;
	xp: number;
	balance: number;
	messages: number;
	standing: MemberStanding;
	roleIds: string[];
	infractions: MemberInfraction[];
	notes: MemberNote[];
};

export type CaseStatus = 'active' | 'expired' | 'revoked';

export type CaseEdit = {
	id: string;
	at: string;
	author: string;
	summary: string;
};

export type ModerationCase = {
	id: string;
	number: number;
	action: ModerationAction;
	targetId: string;
	targetName: string;
	targetInitials: string;
	targetColor: string;
	moderatorName: string;
	moderatorInitials: string;
	moderatorColor: string;
	reason: string;
	createdAt: string;
	expiresAt: string | null;
	revoked: boolean;
	evidence: string[];
	history: CaseEdit[];
};

export const AUDIT_SOURCES = ['web', 'slash', 'api', 'system', 'import'] as const;

export type AuditSource = (typeof AUDIT_SOURCES)[number];

export type AuditActor = {
	id: string | null;
	name: string | null;
	avatarHash: string | null;
};

export type AuditEntry = {
	id: string;
	moduleKey: string | null;
	path: string | null;
	before: unknown;
	after: unknown;
	actor: AuditActor;
	source: AuditSource;
	at: string;
};

export type AuditPage = {
	entries: AuditEntry[];
	nextCursor: string | null;
};

export type TeamRole = 'owner' | 'admin' | 'moderator' | 'viewer';

export type BillingCycle = 'monthly' | 'yearly';

export type InvoiceStatus = 'paid' | 'open' | 'refunded';

export type Invoice = {
	id: string;
	number: string;
	at: string;
	amountCents: number;
	status: InvoiceStatus;
	description: string;
};

export type PaymentMethod = {
	brand: string;
	last4: string;
	expiry: string;
};

export type Usage = {
	limitId: string;
	value: number;
};

export type BillingState = {
	tier: PlanTier;
	cycle: BillingCycle;
	renewsAt: string;
	cancelAtPeriodEnd: boolean;
	daysLeftInPeriod: number;
	daysInPeriod: number;
	paymentMethod: PaymentMethod | null;
	usage: Usage[];
	invoices: Invoice[];
};

export type GuildSettings = {
	locale: string;
	timezone: string;
	embedColor: string;
	botNickname: string;
};
