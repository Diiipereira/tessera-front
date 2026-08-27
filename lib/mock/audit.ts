import type { AuditEntry } from '@/lib/types/management';

export const mockAudit: AuditEntry[] = [
	{
		id: 'a-1',
		actorName: 'lia',
		actorInitials: 'L',
		actorColor: '#fbbf24',
		action: 'Changed AutoMod rule "Invite links"',
		module: 'AutoMod',
		source: 'web',
		at: '2026-08-25T17:52:00.000Z',
		before: { threshold: 1, actions: ['delete'], exemptRoleIds: [] },
		after: { threshold: 1, actions: ['delete', 'warn', 'log'], exemptRoleIds: ['Staff'] }
	},
	{
		id: 'a-2',
		actorName: 'okra',
		actorInitials: 'O',
		actorColor: '#8b5cf6',
		action: 'Timed out tigre for 24h',
		module: 'Moderation',
		source: 'slash',
		at: '2026-08-25T16:00:00.000Z',
		before: {},
		after: { case: 44, target: 'tigre', duration: '24h', reason: 'Kept arguing after a warning.' }
	},
	{
		id: 'a-3',
		actorName: 'brisa',
		actorInitials: 'B',
		actorColor: '#f472b6',
		action: 'Enabled the Levels module',
		module: 'Levels',
		source: 'web',
		at: '2026-08-25T14:18:00.000Z',
		before: { enabled: false, xpMin: 15, xpMax: 25, cooldownSeconds: 60 },
		after: { enabled: true, xpMin: 15, xpMax: 25, cooldownSeconds: 60 }
	},
	{
		id: 'a-4',
		actorName: 'lia',
		actorInitials: 'L',
		actorColor: '#fbbf24',
		action: 'Edited the welcome message',
		module: 'Welcome',
		source: 'web',
		at: '2026-08-25T11:40:00.000Z',
		before: {
			'message.mode': 'text',
			'message.text': 'Welcome {user}!',
			'message.embed.title': ''
		},
		after: {
			'message.mode': 'embed',
			'message.text': 'Welcome {user.mention}! You are member number {memberCount}.',
			'message.embed.title': 'Welcome to {server}'
		}
	},
	{
		id: 'a-5',
		actorName: 'Tessera API',
		actorInitials: 'T',
		actorColor: '#64748b',
		action: 'Synced 24 slash commands with Discord',
		module: 'Commands',
		source: 'api',
		at: '2026-08-25T09:02:00.000Z',
		before: { registered: 22 },
		after: { registered: 24 }
	},
	{
		id: 'a-6',
		actorName: 'okra',
		actorInitials: 'O',
		actorColor: '#8b5cf6',
		action: 'Changed logging channels for Moderation events',
		module: 'Logging',
		source: 'web',
		at: '2026-08-24T20:31:00.000Z',
		before: { 'memberBanned.channel': 'general', 'memberKicked.channel': null },
		after: { 'memberBanned.channel': 'mod-log', 'memberKicked.channel': 'mod-log' }
	},
	{
		id: 'a-7',
		actorName: 'nimbus',
		actorInitials: 'N',
		actorColor: '#34d399',
		action: 'Started a giveaway',
		module: 'Giveaways',
		source: 'slash',
		at: '2026-08-24T18:00:00.000Z',
		before: {},
		after: { prize: 'Steam key', winners: 2, requiredLevel: 5, endsIn: '48h' }
	},
	{
		id: 'a-8',
		actorName: 'lia',
		actorInitials: 'L',
		actorColor: '#fbbf24',
		action: 'Granted brisa the Moderator seat',
		module: 'Team',
		source: 'web',
		at: '2026-08-23T15:12:00.000Z',
		before: { 'brisa.role': 'viewer' },
		after: { 'brisa.role': 'moderator' }
	},
	{
		id: 'a-9',
		actorName: 'brisa',
		actorInitials: 'B',
		actorColor: '#f472b6',
		action: 'Deleted the custom command /coinflip',
		module: 'Custom commands',
		source: 'web',
		at: '2026-08-22T13:26:00.000Z',
		before: { name: 'coinflip', uses: 1204, ephemeral: false, enabled: true },
		after: {}
	},
	{
		id: 'a-10',
		actorName: 'okra',
		actorInitials: 'O',
		actorColor: '#8b5cf6',
		action: 'Changed the economy daily reward',
		module: 'Economy',
		source: 'slash',
		at: '2026-08-21T22:47:00.000Z',
		before: { dailyAmount: 100, streakBonus: 0, dailyCooldownHours: 24 },
		after: { dailyAmount: 150, streakBonus: 25, dailyCooldownHours: 24 }
	},
	{
		id: 'a-11',
		actorName: 'lia',
		actorInitials: 'L',
		actorColor: '#fbbf24',
		action: 'Banned ruido permanently',
		module: 'Moderation',
		source: 'web',
		at: '2026-08-21T03:02:00.000Z',
		before: {},
		after: { case: 43, target: 'ruido', duration: 'permanent', deleteDays: 1 }
	},
	{
		id: 'a-12',
		actorName: 'Tessera API',
		actorInitials: 'T',
		actorColor: '#64748b',
		action: 'Rotated the webhook signing secret',
		module: 'Settings',
		source: 'api',
		at: '2026-08-20T06:00:00.000Z',
		before: { secretAge: '90 days' },
		after: { secretAge: '0 days' }
	}
];
