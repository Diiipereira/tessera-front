import type {
	EmbedDraft,
	MessageDraft,
	MessageVariable,
	ModerationConfig,
	ModuleSummary,
	WelcomeConfig
} from '@/lib/types/modules';

export const mockModules: ModuleSummary[] = [
	{
		id: 'welcome',
		name: 'Welcome',
		description: 'Greet new members and hand out roles.',
		category: 'Engagement',
		status: 'active',
		premium: false
	},
	{
		id: 'moderation',
		name: 'Moderation',
		description: 'Warns, timeouts, bans and a case log.',
		category: 'Safety',
		status: 'active',
		premium: false
	},
	{
		id: 'automod',
		name: 'AutoMod',
		description: 'Rules that act before a human has to.',
		category: 'Safety',
		status: 'active',
		premium: false
	},
	{
		id: 'logging',
		name: 'Logging',
		description: 'Write server events to a channel.',
		category: 'Safety',
		status: 'active',
		premium: false
	},
	{
		id: 'levels',
		name: 'Levels',
		description: 'XP, ranks and role rewards.',
		category: 'Engagement',
		status: 'active',
		premium: false
	},
	{
		id: 'economy',
		name: 'Economy',
		description: 'Currency, shop and transfers.',
		category: 'Engagement',
		status: 'active',
		premium: true
	},
	{
		id: 'tickets',
		name: 'Tickets',
		description: 'Private support channels on demand.',
		category: 'Community',
		status: 'active',
		premium: false
	},
	{
		id: 'reaction-roles',
		name: 'Reaction roles',
		description: 'Members pick their own roles.',
		category: 'Community',
		status: 'active',
		premium: false
	},
	{
		id: 'giveaways',
		name: 'Giveaways',
		description: 'Timed draws with entry requirements.',
		category: 'Community',
		status: 'active',
		premium: false
	},
	{
		id: 'custom-commands',
		name: 'Custom commands',
		description: 'Your own slash commands, no code.',
		category: 'Utility',
		status: 'active',
		premium: false
	},
	{
		id: 'scheduled',
		name: 'Scheduled messages',
		description: 'Post on a timer or a cron.',
		category: 'Utility',
		status: 'active',
		premium: true
	}
];

export const mockVariables: MessageVariable[] = [
	{ token: '{user}', description: 'The member, as plain text', sample: 'novato' },
	{ token: '{user.mention}', description: 'Pings the member', sample: '@novato' },
	{ token: '{user.tag}', description: 'Username with discriminator', sample: 'novato#4821' },
	{ token: '{server}', description: 'The server, as plain text', sample: 'Pixel Foundry' },
	{ token: '{server.name}', description: 'Same as {server}', sample: 'Pixel Foundry' },
	{ token: '{memberCount}', description: 'How many members after joining', sample: '12,432' },
	{ token: '{channel}', description: 'The channel the message lands in', sample: '#welcome' },
	{ token: '{date}', description: "Today's date in the server timezone", sample: '25/08/2026' },
	{ token: '{level}', description: 'The member level', sample: '7' },
	{ token: '{balance}', description: 'The member balance', sample: '1,240' }
];

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

const welcomeMessage: MessageDraft = {
	mode: 'embed',
	text: 'Welcome {user.mention}! You are member number {memberCount}.',
	embed: {
		...emptyEmbed(),
		title: 'Welcome to {server}',
		description:
			'Glad you made it, {user.mention}. Read the rules in {channel} and say hello.\n\nYou are our {memberCount}th member.',
		color: '#5865f2',
		fields: [
			{ id: 'f1', name: 'Getting started', value: 'Pick your roles in #roles', inline: true },
			{ id: 'f2', name: 'Need help?', value: 'Open a ticket any time', inline: true }
		],
		footerText: 'Joined {date}',
		timestamp: true
	}
};

export const mockWelcomeConfig: WelcomeConfig = {
	enabled: true,
	channelId: '901234567890123001',
	message: welcomeMessage,
	autoRoleIds: ['801234567890123003'],
	pingMode: 'none',
	deleteAfter: null
};

export const mockModerationConfig: ModerationConfig = {
	enabled: true,
	modRoleIds: ['801234567890123011', '801234567890123012'],
	mutedRoleId: null,
	timeoutDefault: '1h',
	muteDefault: '24h',
	banDeleteDays: '1',
	reasonRequired: true,
	dmOnPunish: true,
	dmTemplate:
		'You received a {action} in {server}.\nReason: {reason}\nDuration: {duration}\n\nIf you think this was a mistake, you can appeal.',
	appealUrl: 'https://forms.example.com/appeal',
	protectedRoleIds: ['801234567890123010'],
	escalation: [
		{ id: 'e1', atWarnings: 3, action: 'timeout', duration: '1h' },
		{ id: 'e2', atWarnings: 5, action: 'mute', duration: '24h' },
		{ id: 'e3', atWarnings: 7, action: 'ban', duration: 'permanent' }
	]
};
