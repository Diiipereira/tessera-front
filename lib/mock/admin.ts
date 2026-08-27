import type {
	BlacklistEntry,
	TenantDailyPoint,
	TenantDetail,
	TenantModuleState,
	TenantStaffMember,
	TenantSummary
} from '@/lib/types/admin';
import type { ModuleId } from '@/lib/types/modules';
import { MOCK_NOW } from '@/lib/time';

export const mockTenants: TenantSummary[] = [
	{
		id: '842315097461823104',
		name: 'Pixel Foundry',
		initials: 'PF',
		color: '#8b5cf6',
		ownerId: '204255221017214977',
		ownerName: 'kaya',
		memberCount: 12431,
		planKey: 'pro',
		locale: 'pt-BR',
		setupCompleted: true,
		joinedAt: '2026-02-11T09:14:00.000Z',
		leftAt: null
	},
	{
		id: '918273645510293847',
		name: 'Fórum dos Devs',
		initials: 'FD',
		color: '#4ade80',
		ownerId: '311902739481231360',
		ownerName: 'rafa',
		memberCount: 27650,
		planKey: 'ultimate',
		locale: 'pt-BR',
		setupCompleted: true,
		joinedAt: '2025-11-03T20:41:00.000Z',
		leftAt: null
	},
	{
		id: '731204885219930112',
		name: 'Late Night Café',
		initials: 'LC',
		color: '#f87171',
		ownerId: '480219374012938470',
		ownerName: 'mel',
		memberCount: 3908,
		planKey: 'free',
		locale: 'en-US',
		setupCompleted: true,
		joinedAt: '2026-05-27T14:02:00.000Z',
		leftAt: null
	},
	{
		id: '609183726450918273',
		name: 'Estúdio Aurora',
		initials: 'EA',
		color: '#38bdf8',
		ownerId: '129384756019283746',
		ownerName: 'nina',
		memberCount: 1544,
		planKey: 'pro',
		locale: 'pt-BR',
		setupCompleted: true,
		joinedAt: '2026-06-19T11:27:00.000Z',
		leftAt: null
	},
	{
		id: '773829104857362910',
		name: 'Speedrun BR',
		initials: 'SB',
		color: '#fbbf24',
		ownerId: '556172839405162738',
		ownerName: 'juno',
		memberCount: 8820,
		planKey: 'free',
		locale: 'pt-BR',
		setupCompleted: true,
		joinedAt: '2026-04-02T17:55:00.000Z',
		leftAt: null
	},
	{
		id: '482910573829104857',
		name: 'Quiet Hours',
		initials: 'QH',
		color: '#a78bfa',
		ownerId: '918273645019283746',
		ownerName: 'sol',
		memberCount: 271,
		planKey: 'free',
		locale: 'en-US',
		setupCompleted: false,
		joinedAt: '2026-08-21T08:10:00.000Z',
		leftAt: null
	},
	{
		id: '395018273645019283',
		name: 'Mesa de RPG',
		initials: 'MR',
		color: '#f472b6',
		ownerId: '204255221017214977',
		ownerName: 'kaya',
		memberCount: 613,
		planKey: 'free',
		locale: 'pt-BR',
		setupCompleted: false,
		joinedAt: '2026-08-24T22:38:00.000Z',
		leftAt: null
	},
	{
		id: '150293847561029384',
		name: 'Retro Arcade',
		initials: 'RA',
		color: '#fb923c',
		ownerId: '673829104857362910',
		ownerName: 'vito',
		memberCount: 4102,
		planKey: 'pro',
		locale: 'en-US',
		setupCompleted: true,
		joinedAt: '2025-09-14T13:20:00.000Z',
		leftAt: '2026-07-30T10:05:00.000Z'
	},
	{
		id: '287465019283746501',
		name: 'Hydra Guild',
		initials: 'HG',
		color: '#2dd4bf',
		ownerId: '847362910485736291',
		ownerName: 'ori',
		memberCount: 990,
		planKey: 'free',
		locale: 'en-US',
		setupCompleted: true,
		joinedAt: '2026-01-08T06:44:00.000Z',
		leftAt: '2026-08-12T19:31:00.000Z'
	}
];

const MODULE_LABELS: Record<ModuleId, string> = {
	welcome: 'Welcome',
	moderation: 'Moderation',
	automod: 'AutoMod',
	logging: 'Logging',
	levels: 'Levels',
	economy: 'Economy',
	tickets: 'Tickets',
	'reaction-roles': 'Reaction roles',
	giveaways: 'Giveaways',
	'custom-commands': 'Custom commands',
	scheduled: 'Scheduled messages'
};

const MODULE_KEYS = Object.keys(MODULE_LABELS) as ModuleId[];

function seedOf(id: string): number {
	let seed = 0;
	for (const char of id) seed = (seed * 31 + char.charCodeAt(0)) % 100_000;
	return seed;
}

function pseudoRandom(seed: number, step: number): number {
	return ((seed * 9301 + step * 49297) % 233280) / 233280;
}

function buildModules(tenant: TenantSummary): TenantModuleState[] {
	const seed = seedOf(tenant.id);

	return MODULE_KEYS.map((key, index) => {
		const roll = pseudoRandom(seed, index + 1);
		const enabled = tenant.setupCompleted && roll > 0.38;
		const version = enabled ? 2 + Math.floor(roll * 11) : 1;
		const daysAgo = 1 + Math.floor(roll * 40);

		return {
			key,
			label: MODULE_LABELS[key],
			enabled,
			version,
			updatedAt: enabled ? new Date(MOCK_NOW.getTime() - daysAgo * 86_400_000).toISOString() : null,
			updatedByName: enabled ? tenant.ownerName : null
		};
	});
}

function buildActivity(tenant: TenantSummary): TenantDailyPoint[] {
	const seed = seedOf(tenant.id);
	const scale = Math.max(tenant.memberCount / 900, 1);
	const gone = tenant.leftAt === null ? null : new Date(tenant.leftAt).getTime();

	return Array.from({ length: 30 }, (_, index) => {
		const at = new Date(MOCK_NOW.getTime() - (29 - index) * 86_400_000);
		const silent = gone !== null && at.getTime() > gone;
		const wave = pseudoRandom(seed, index + 7);

		return {
			day: at.toISOString().slice(0, 10),
			messages: silent ? 0 : Math.round((120 + wave * 260) * scale),
			commands: silent ? 0 : Math.round((14 + wave * 38) * scale),
			joins: silent ? 0 : Math.round(2 + wave * 9 * Math.min(scale, 4)),
			leaves: silent ? 0 : Math.round(1 + wave * 5 * Math.min(scale, 3))
		};
	});
}

function buildStaff(tenant: TenantSummary): TenantStaffMember[] {
	const owner: TenantStaffMember = {
		userId: tenant.ownerId,
		name: tenant.ownerName,
		initials: tenant.ownerName.slice(0, 2).toUpperCase(),
		color: tenant.color,
		role: 'owner',
		source: 'guild-owner',
		grantedAt: null
	};

	if (!tenant.setupCompleted) return [owner];

	return [
		owner,
		{
			userId: '731045928374019283',
			name: 'bruna',
			initials: 'BR',
			color: '#60a5fa',
			role: 'admin',
			source: 'guild-staff',
			grantedAt: '2026-06-02T12:00:00.000Z'
		},
		{
			userId: '648293017465019283',
			name: 'theo',
			initials: 'TH',
			color: '#34d399',
			role: 'moderator',
			source: 'guild-staff',
			grantedAt: '2026-07-18T09:30:00.000Z'
		}
	];
}

export function findTenant(guildId: string): TenantDetail | null {
	const summary = mockTenants.find((tenant) => tenant.id === guildId);
	if (!summary) return null;

	return {
		summary,
		modules: buildModules(summary),
		staff: buildStaff(summary),
		activity: buildActivity(summary),
		subscription:
			summary.planKey === 'free'
				? null
				: {
						planKey: summary.planKey,
						status: summary.leftAt === null ? 'active' : 'canceled',
						provider: 'stripe',
						currentPeriodEnd: '2026-09-11T00:00:00.000Z',
						cancelAtPeriodEnd: summary.leftAt !== null
					}
	};
}

export const mockBlacklist: BlacklistEntry[] = [
	{
		targetType: 'user',
		targetId: '399201847562910384',
		name: 'raid-account-01',
		reason: 'Mass DM advertising across four tenants.',
		createdByName: 'diogo',
		createdAt: '2026-08-19T21:12:00.000Z',
		expiresAt: null
	},
	{
		targetType: 'guild',
		targetId: '507162839405162738',
		name: 'Free Nitro Zone',
		reason: 'Using the bot to run a phishing funnel.',
		createdByName: 'diogo',
		createdAt: '2026-07-04T15:48:00.000Z',
		expiresAt: null
	},
	{
		targetType: 'user',
		targetId: '284756019283746501',
		name: 'chargeback-serial',
		reason: 'Three chargebacks after using the paid plan.',
		createdByName: 'diogo',
		createdAt: '2026-08-23T10:02:00.000Z',
		expiresAt: '2026-11-23T10:02:00.000Z'
	},
	{
		targetType: 'user',
		targetId: '918456019283746502',
		name: 'api-hammer',
		reason: 'Scripted the dashboard endpoints for two days.',
		createdByName: 'diogo',
		createdAt: '2026-06-01T08:00:00.000Z',
		expiresAt: '2026-08-01T08:00:00.000Z'
	}
];
