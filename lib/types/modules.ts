export type ModuleId =
	| 'welcome'
	| 'moderation'
	| 'automod'
	| 'logging'
	| 'levels'
	| 'economy'
	| 'tickets'
	| 'reaction-roles'
	| 'giveaways'
	| 'custom-commands'
	| 'scheduled';

export type ModuleStatus = 'active' | 'off' | 'needs-setup';

export type ModuleCategory = 'Engagement' | 'Safety' | 'Community' | 'Utility';

export type ModuleSummary = {
	id: ModuleId;
	category: ModuleCategory;
	status: ModuleStatus;
	premium: boolean;
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

export type EscalationRule = {
	id: string;
	atWarnings: number;
	action: ModerationAction;
	duration: string;
};

export type ModerationConfig = {
	enabled: boolean;
	modRoleIds: string[];
	mutedRoleId: string | null;
	timeoutDefault: string;
	muteDefault: string;
	banDeleteDays: string;
	reasonRequired: boolean;
	dmOnPunish: boolean;
	dmTemplate: string;
	appealUrl: string;
	protectedRoleIds: string[];
	escalation: EscalationRule[];
};

export type MessageVariable = {
	token: string;
	key: string;
	sample: string;
};
