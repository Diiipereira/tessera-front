export const DISCORD = {
	surface: '#2b2d31',
	embed: '#232428',
	button: '#4e5058',
	reaction: '#3b3d44',
	text: '#dbdee1',
	muted: '#949ba4'
} as const;

export const BLURPLE = '#5865f2';

export const DISCORD_BUTTON = {
	primary: BLURPLE,
	secondary: DISCORD.button,
	success: '#248046',
	danger: '#da373c'
} as const;

export type DiscordButtonStyle = keyof typeof DISCORD_BUTTON;

export const MENTION = {
	fill: 'rgba(88, 101, 242, 0.3)',
	text: '#dee0fc'
} as const;

export const VARIABLE = {
	fill: 'rgba(255, 255, 255, 0.08)',
	text: '#f2f3f5'
} as const;

export const EMBED_SWATCHES = [
	'#5865f2',
	'#57f287',
	'#fee75c',
	'#eb459e',
	'#ed4245',
	'#8b5cf6'
] as const;
