import type {
	ActivityEntry,
	ActivityPoint,
	ActivityRange,
	BotHealth,
	SetupChecklistItem,
	Stat
} from '@/lib/types/overview';

export const mockStats: Stat[] = [
	{ id: 'members', label: 'Members', value: '12,431', delta: '+184 this week', direction: 'up' },
	{
		id: 'commands',
		label: 'Commands used · 7d',
		value: '18,204',
		delta: '+12% vs last week',
		direction: 'up'
	},
	{
		id: 'modules',
		label: 'Active modules',
		value: '8 of 11',
		delta: '3 need setup',
		direction: 'flat'
	},
	{ id: 'tickets', label: 'Open tickets', value: '6', delta: '−2 vs last week', direction: 'down' }
];

function series(
	labels: string[],
	messages: number[],
	commands: number[],
	joins: number[]
): ActivityPoint[] {
	return labels.map((label, index) => ({
		index,
		label,
		messages: messages[index] ?? 0,
		commands: commands[index] ?? 0,
		joins: joins[index] ?? 0
	}));
}

export const mockActivity: Record<ActivityRange, ActivityPoint[]> = {
	'7d': series(
		['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
		[420, 512, 486, 604, 578, 690, 712],
		[120, 168, 142, 210, 196, 244, 268],
		[18, 26, 22, 31, 28, 44, 39]
	),
	'30d': series(
		['1 Aug', '4', '7', '10', '13', '16', '19', '22', '25', '28', '31', 'Today'],
		[380, 402, 448, 470, 512, 498, 540, 588, 604, 646, 690, 712],
		[98, 112, 134, 148, 168, 176, 196, 214, 228, 246, 258, 268],
		[14, 18, 16, 22, 25, 21, 28, 32, 30, 38, 41, 39]
	),
	'90d': series(
		[
			'27 May',
			'3 Jun',
			'10',
			'17',
			'24',
			'1 Jul',
			'8',
			'15',
			'22',
			'29',
			'5 Aug',
			'12',
			'19',
			'24',
			'Today'
		],
		[240, 268, 302, 288, 340, 372, 398, 412, 460, 488, 512, 566, 604, 648, 712],
		[62, 74, 88, 82, 104, 118, 126, 138, 158, 172, 188, 214, 238, 252, 268],
		[8, 11, 14, 12, 17, 19, 22, 21, 26, 29, 31, 34, 37, 41, 39]
	)
};

export const mockBotHealth: BotHealth = {
	online: true,
	uptime: '9d 4h',
	latencyMs: 47,
	shard: '0 of 1',
	warnings: ['Missing Manage Roles in #rules', 'Cannot post in the Lounge voice channel']
};

export const mockRecentActivity: ActivityEntry[] = [
	{
		id: 'a1',
		actorName: 'lia',
		actorInitials: 'L',
		actorColor: '#fbbf24',
		action: 'enabled',
		target: 'Welcome module',
		source: 'web',
		at: '4 minutes ago'
	},
	{
		id: 'a2',
		actorName: 'marcos',
		actorInitials: 'M',
		actorColor: '#60a5fa',
		action: 'timed out',
		target: '@quietstorm for 1h',
		source: 'slash',
		at: '22 minutes ago'
	},
	{
		id: 'a3',
		actorName: 'Ana Paula',
		actorInitials: 'A',
		actorColor: '#4ade80',
		action: 'changed the log channel to',
		target: '#mod-log',
		source: 'web',
		at: '2 hours ago'
	},
	{
		id: 'a4',
		actorName: 'Tobi',
		actorInitials: 'T',
		actorColor: '#f87171',
		action: 'created the AutoMod rule',
		target: 'Invite links',
		source: 'web',
		at: '5 hours ago'
	},
	{
		id: 'a5',
		actorName: 'marcos',
		actorInitials: 'M',
		actorColor: '#60a5fa',
		action: 'started a giveaway for',
		target: 'Nitro (3 winners)',
		source: 'slash',
		at: 'Yesterday'
	}
];

export const mockSetupChecklist: SetupChecklistItem[] = [
	{
		id: 'welcome',
		label: 'Pick a welcome channel',
		done: true,
		action: 'Done',
		path: '/modules/welcome'
	},
	{
		id: 'moderation',
		label: 'Set your moderator roles',
		done: false,
		action: 'Set up',
		path: '/modules/moderation'
	},
	{
		id: 'logging',
		label: 'Turn on the audit log',
		done: false,
		action: 'Turn on',
		path: '/modules/logging'
	}
];
