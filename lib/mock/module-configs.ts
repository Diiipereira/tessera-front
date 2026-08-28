import type {
	AutoModConfig,
	CustomCommandsConfig,
	EconomyConfig,
	GiveawaysConfig,
	LeaderboardEntry,
	LevelsConfig,
	LoggingConfig,
	ReactionRolesConfig,
	ScheduledConfig,
	TicketsConfig,
	Transaction,
	OpenTicket
} from '@/lib/types/module-configs';
import type { EmbedDraft, MessageDraft } from '@/lib/types/modules';

function emptyEmbed(): EmbedDraft {
	return {
		authorName: '',
		title: '',
		description: '',
		color: '#5865f2',
		fields: [],
		imageUrl: '',
		thumbnailUrl: '',
		footerText: '',
		timestamp: false
	};
}

function text(value: string): MessageDraft {
	return { mode: 'text', text: value, embed: emptyEmbed() };
}

export const mockAutoModConfig: AutoModConfig = {
	enabled: true,
	rules: [
		{
			id: 'r1',
			name: 'Message spam',
			trigger: 'spam',
			threshold: 5,
			windowSeconds: 5,
			actions: ['delete', 'timeout', 'log'],
			exemptRoleIds: ['801234567890123011'],
			exemptChannelIds: [],
			words: [],
			enabled: true
		},
		{
			id: 'r2',
			name: 'Discord invites',
			trigger: 'invites',
			threshold: 1,
			windowSeconds: 0,
			actions: ['delete', 'warn', 'log'],
			exemptRoleIds: ['801234567890123011', '801234567890123010'],
			exemptChannelIds: ['901234567890123004'],
			words: [],
			enabled: true
		},
		{
			id: 'r3',
			name: 'Mass mentions',
			trigger: 'mentions',
			threshold: 6,
			windowSeconds: 10,
			actions: ['delete', 'timeout'],
			exemptRoleIds: ['801234567890123011'],
			exemptChannelIds: [],
			words: [],
			enabled: true
		},
		{
			id: 'r4',
			name: 'Blocked words',
			trigger: 'words',
			threshold: 1,
			windowSeconds: 0,
			actions: ['delete', 'warn'],
			exemptRoleIds: [],
			exemptChannelIds: [],
			words: ['scam', 'freenitro', 'airdrop'],
			enabled: false
		}
	]
};

export const mockLoggingConfig: LoggingConfig = {
	enabled: true,
	ignoredChannelIds: ['901234567890123005'],
	ignoredRoleIds: [],
	events: [
		{
			id: 'message_delete',
			group: 'Messages',
			channelId: '901234567890123008',
			enabled: true
		},
		{
			id: 'message_edit',
			group: 'Messages',
			channelId: '901234567890123008',
			enabled: true
		},
		{
			id: 'bulk_delete',
			group: 'Messages',
			channelId: '901234567890123008',
			enabled: false
		},
		{
			id: 'member_join',
			group: 'Members',
			channelId: '901234567890123009',
			enabled: true
		},
		{
			id: 'member_leave',
			group: 'Members',
			channelId: '901234567890123009',
			enabled: true
		},
		{
			id: 'nickname',
			group: 'Members',
			channelId: null,
			enabled: false
		},
		{
			id: 'ban',
			group: 'Moderation',
			channelId: '901234567890123008',
			enabled: true
		},
		{
			id: 'timeout',
			group: 'Moderation',
			channelId: '901234567890123008',
			enabled: true
		},
		{
			id: 'channel_change',
			group: 'Server',
			channelId: null,
			enabled: false
		},
		{
			id: 'role_change',
			group: 'Server',
			channelId: null,
			enabled: false
		},
		{
			id: 'voice_join',
			group: 'Voice',
			channelId: null,
			enabled: false
		}
	]
};

export const mockLevelsConfig: LevelsConfig = {
	enabled: true,
	xpMin: 15,
	xpMax: 25,
	cooldownSeconds: 60,
	voiceXpPerMinute: 5,
	curve: 100,
	announce: true,
	announceChannelId: '901234567890123004',
	announceInPlace: false,
	announceMessage: text('{user.mention} reached level {level}!'),
	rewards: [
		{ id: 'rw1', level: 5, roleId: '801234567890123002', removePrevious: false },
		{ id: 'rw2', level: 20, roleId: '801234567890123003', removePrevious: true }
	],
	noXpChannelIds: ['901234567890123005'],
	noXpRoleIds: []
};

export const mockLeaderboard: LeaderboardEntry[] = [
	{ rank: 1, name: 'kestrel', initials: 'KE', color: '#5865f2', level: 42, xp: 184320 },
	{ rank: 2, name: 'mora', initials: 'MO', color: '#0d9488', level: 39, xp: 161004 },
	{ rank: 3, name: 'juno', initials: 'JU', color: '#d97706', level: 36, xp: 139870 },
	{ rank: 4, name: 'pilar', initials: 'PI', color: '#db2777', level: 31, xp: 104220 },
	{ rank: 5, name: 'okra', initials: 'OK', color: '#57f287', level: 28, xp: 87410 },
	{ rank: 6, name: 'ferro', initials: 'FE', color: '#eb459e', level: 24, xp: 64980 },
	{ rank: 7, name: 'nube', initials: 'NU', color: '#3ba55d', level: 21, xp: 51330 },
	{ rank: 8, name: 'tilde', initials: 'TI', color: '#f47fff', level: 18, xp: 38940 },
	{ rank: 9, name: 'vela', initials: 'VE', color: '#fee75c', level: 15, xp: 27600 },
	{ rank: 10, name: 'zinco', initials: 'ZI', color: '#ed4245', level: 12, xp: 18240 }
];

export const mockEconomyConfig: EconomyConfig = {
	enabled: true,
	currencyName: 'Shards',
	currencySymbol: '🪙',
	startingBalance: 100,
	dailyAmount: 250,
	dailyCooldownHours: 24,
	workAmount: 75,
	workCooldownMinutes: 30,
	streakBonus: 25,
	transferTaxPercent: 5,
	shop: [
		{
			id: 's1',
			name: 'Booster colour',
			description: 'A custom name colour for 30 days.',
			price: 2500,
			roleId: '801234567890123003',
			stock: null,
			perUserLimit: 1
		},
		{
			id: 's2',
			name: 'Event host',
			description: 'Run your own event with bot help.',
			price: 8000,
			roleId: '801234567890123004',
			stock: 5,
			perUserLimit: 1
		},
		{
			id: 's3',
			name: 'Lottery ticket',
			description: 'One entry in the weekly draw.',
			price: 150,
			roleId: null,
			stock: null,
			perUserLimit: null
		}
	]
};

export const mockTransactions: Transaction[] = [
	{
		id: 't1',
		kind: 'daily',
		actorName: 'kestrel',
		actorInitials: 'KE',
		actorColor: '#5865f2',
		amount: 250,
		note: 'Daily claim, 6 day streak',
		at: '4 minutes ago'
	},
	{
		id: 't2',
		kind: 'purchase',
		actorName: 'mora',
		actorInitials: 'MO',
		actorColor: '#0d9488',
		amount: -2500,
		note: 'Booster colour',
		at: '22 minutes ago'
	},
	{
		id: 't3',
		kind: 'transfer',
		actorName: 'juno',
		actorInitials: 'JU',
		actorColor: '#d97706',
		amount: -500,
		note: 'To @pilar, 25 tax',
		at: '1 hour ago'
	},
	{
		id: 't4',
		kind: 'work',
		actorName: 'okra',
		actorInitials: 'OK',
		actorColor: '#57f287',
		amount: 75,
		note: 'Worked as a courier',
		at: '2 hours ago'
	},
	{
		id: 't5',
		kind: 'admin',
		actorName: 'ferro',
		actorInitials: 'FE',
		actorColor: '#eb459e',
		amount: 1000,
		note: 'Event prize, by @Staff',
		at: 'Yesterday'
	}
];

export const mockTicketsConfig: TicketsConfig = {
	enabled: true,
	transcripts: true,
	autoCloseHours: 48,
	askForRating: true,
	panels: [
		{
			id: 'p1',
			name: 'General support',
			categoryId: '901234567890123006',
			staffRoleIds: ['801234567890123011'],
			namingPattern: 'ticket-{number}',
			maxOpenPerUser: 1,
			buttonLabel: 'Open a ticket',
			message: text('Need a hand? Press the button and a staff member will pick it up.')
		},
		{
			id: 'p2',
			name: 'Report a member',
			categoryId: '901234567890123006',
			staffRoleIds: ['801234567890123011', '801234567890123012'],
			namingPattern: 'report-{user}',
			maxOpenPerUser: 2,
			buttonLabel: 'Report',
			message: text('Something happened? Tell us here, privately.')
		}
	]
};

export const mockOpenTickets: OpenTicket[] = [
	{
		id: 'ot1',
		number: 184,
		subject: 'Cannot claim my booster role',
		openerName: 'vela',
		openerInitials: 'VE',
		openerColor: '#fee75c',
		claimedBy: 'ferro',
		age: '12 minutes',
		status: 'claimed'
	},
	{
		id: 'ot2',
		number: 183,
		subject: 'Someone is spamming in general',
		openerName: 'nube',
		openerInitials: 'NU',
		openerColor: '#3ba55d',
		claimedBy: null,
		age: '48 minutes',
		status: 'open'
	},
	{
		id: 'ot3',
		number: 182,
		subject: 'Wrong level after the reset',
		openerName: 'tilde',
		openerInitials: 'TI',
		openerColor: '#f47fff',
		claimedBy: 'mora',
		age: '3 hours',
		status: 'claimed'
	},
	{
		id: 'ot4',
		number: 181,
		subject: 'Appeal for my timeout',
		openerName: 'zinco',
		openerInitials: 'ZI',
		openerColor: '#ed4245',
		claimedBy: null,
		age: '5 hours',
		status: 'open'
	}
];

export const mockReactionRolesConfig: ReactionRolesConfig = {
	enabled: true,
	panels: [
		{
			id: 'rp1',
			name: 'Pick your colours',
			channelId: '901234567890123004',
			mode: 'unique',
			useButtons: true,
			options: [
				{
					id: 'o1',
					emoji: '🟦',
					roleId: '801234567890123002',
					label: 'Blue',
					description: 'A calm name colour'
				},
				{
					id: 'o2',
					emoji: '🟩',
					roleId: '801234567890123003',
					label: 'Green',
					description: 'A loud name colour'
				}
			]
		},
		{
			id: 'rp2',
			name: 'Verify to enter',
			channelId: '901234567890123002',
			mode: 'verify',
			useButtons: true,
			options: [
				{
					id: 'o3',
					emoji: '✅',
					roleId: '801234567890123001',
					label: 'I read the rules',
					description: ''
				}
			]
		}
	]
};

export const mockGiveawaysConfig: GiveawaysConfig = {
	enabled: true,
	defaultWinners: 1,
	dmWinners: true,
	giveaways: [
		{
			id: 'g1',
			prize: 'Nitro for a month',
			winners: 1,
			entries: 284,
			hostName: 'mora',
			hostInitials: 'MO',
			hostColor: '#0d9488',
			state: 'active',
			endsInSeconds: 7245,
			startsIn: '',
			wonBy: [],
			requiredRoleIds: ['801234567890123002'],
			requiredLevel: 5
		},
		{
			id: 'g2',
			prize: 'Steam key bundle',
			winners: 3,
			entries: 96,
			hostName: 'ferro',
			hostInitials: 'FE',
			hostColor: '#eb459e',
			state: 'active',
			endsInSeconds: 176400,
			startsIn: '',
			wonBy: [],
			requiredRoleIds: [],
			requiredLevel: 0
		},
		{
			id: 'g3',
			prize: 'Custom role colour',
			winners: 2,
			entries: 0,
			hostName: 'juno',
			hostInitials: 'JU',
			hostColor: '#d97706',
			state: 'scheduled',
			endsInSeconds: 0,
			startsIn: 'in 2 days',
			wonBy: [],
			requiredRoleIds: [],
			requiredLevel: 0
		},
		{
			id: 'g4',
			prize: 'Server booster slot',
			winners: 1,
			entries: 412,
			hostName: 'kestrel',
			hostInitials: 'KE',
			hostColor: '#5865f2',
			state: 'ended',
			endsInSeconds: 0,
			startsIn: '',
			wonBy: ['okra'],
			requiredRoleIds: [],
			requiredLevel: 0
		}
	]
};

export const mockCustomCommandsConfig: CustomCommandsConfig = {
	enabled: true,
	commands: [
		{
			id: 'c1',
			name: 'rules',
			description: 'Post the server rules',
			uses: 1284,
			ephemeral: false,
			enabled: true,
			requiredRoleIds: [],
			response: text('Read them in {channel}. Short version: be decent.')
		},
		{
			id: 'c2',
			name: 'ip',
			description: 'Show the game server address',
			uses: 904,
			ephemeral: true,
			enabled: true,
			requiredRoleIds: [],
			response: text('play.example.net — port 25565')
		},
		{
			id: 'c3',
			name: 'staffping',
			description: 'Ping the staff team',
			uses: 42,
			ephemeral: false,
			enabled: false,
			requiredRoleIds: ['801234567890123011'],
			response: text('Staff have been notified.')
		}
	]
};

export const mockScheduledConfig: ScheduledConfig = {
	enabled: true,
	timezone: 'America/Sao_Paulo',
	messages: [
		{
			id: 'sm1',
			name: 'Weekly event reminder',
			channelId: '901234567890123003',
			kind: 'recurring',
			runAt: '',
			days: ['fri'],
			timeOfDay: '19:00',
			enabled: true,
			message: text('Event tonight at 20:00. Bring a friend.')
		},
		{
			id: 'sm2',
			name: 'Monday standup',
			channelId: '901234567890123004',
			kind: 'recurring',
			runAt: '',
			days: ['mon', 'wed'],
			timeOfDay: '09:30',
			enabled: true,
			message: text('Standup in 30 minutes.')
		},
		{
			id: 'sm3',
			name: 'Maintenance notice',
			channelId: '901234567890123003',
			kind: 'once',
			runAt: '2026-09-02T22:00',
			days: [],
			timeOfDay: '22:00',
			enabled: false,
			message: text('The game server is down for maintenance from 22:00 to 23:00.')
		}
	]
};
