export const MODULE_IDS = [
	'welcome',
	'moderation',
	'automod',
	'logging',
	'levels',
	'economy',
	'tickets',
	'reaction-roles',
	'giveaways',
	'custom-commands',
	'scheduled'
] as const;

export type ModuleId = (typeof MODULE_IDS)[number];

export type ModuleStatus = 'active' | 'off' | 'needs-setup';

export const MODULE_CATEGORIES = ['engagement', 'safety', 'community', 'utility'] as const;

export type ModuleCategory = (typeof MODULE_CATEGORIES)[number];

export type ModuleSummary = {
	id: ModuleId;
	category: ModuleCategory;
	status: ModuleStatus;
	version: number;
};

export type EmbedField = {
	id: string;
	name: string;
	value: string;
	inline: boolean;
};

export type EmbedDraft = {
	authorName: string;
	title: string;
	description: string;
	color: string;
	fields: EmbedField[];
	imageUrl: string;
	thumbnailUrl: string;
	footerText: string;
	timestamp: boolean;
};

export type MessageMode = 'text' | 'embed';

export type MessageDraft = {
	mode: MessageMode;
	text: string;
	embed: EmbedDraft;
};

export type WelcomePingMode = 'none' | 'inline' | 'ghost';

export type WelcomeConfig = {
	enabled: boolean;
	channelId: string | null;
	message: MessageDraft;
	autoRoleIds: string[];
	pingMode: WelcomePingMode;
	deleteAfter: number | null;
};

export type ModerationAction = 'warn' | 'timeout' | 'mute' | 'kick' | 'ban';

export type MessageVariable = {
	token: string;
	key: string;
	sample: string;
};
