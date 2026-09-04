import type { EmbedDraft, MessageDraft, MessageVariable, WelcomeConfig } from '@/lib/types/modules';

export const mockVariables: MessageVariable[] = [
	{ token: '{user}', key: 'user', sample: 'novato' },
	{ token: '{user.mention}', key: 'userMention', sample: '@novato' },
	{ token: '{user.tag}', key: 'userTag', sample: 'novato#4821' },
	{ token: '{server}', key: 'server', sample: 'Pixel Foundry' },
	{ token: '{server.name}', key: 'serverName', sample: 'Pixel Foundry' },
	{ token: '{memberCount}', key: 'memberCount', sample: '12,432' },
	{ token: '{channel}', key: 'channel', sample: '#welcome' },
	{ token: '{date}', key: 'date', sample: '25/08/2026' },
	{ token: '{level}', key: 'level', sample: '7' },
	{ token: '{balance}', key: 'balance', sample: '1,240' }
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
