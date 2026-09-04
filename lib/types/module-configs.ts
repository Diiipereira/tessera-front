import type { MessageDraft } from './modules';

export type AutoModTrigger =
	'spam' | 'invites' | 'links' | 'caps' | 'mentions' | 'words' | 'attachments';

export type AutoModAction = 'delete' | 'warn' | 'timeout' | 'kick' | 'ban' | 'log';

export type AutoModRule = {
	id: string;
	name: string;
	trigger: AutoModTrigger;
	threshold: number;
	windowSeconds: number;
	actions: AutoModAction[];
	exemptRoleIds: string[];
	exemptChannelIds: string[];
	words: string[];
	enabled: boolean;
};

export type AutoModConfig = {
	enabled: boolean;
	rules: AutoModRule[];
};

export type LogGroup = string;

export type LogEvent = {
	id: string;
	group: LogGroup;
	channelId: string | null;
	enabled: boolean;
};

export type LoggingConfig = {
	enabled: boolean;
	events: LogEvent[];
	ignoredChannelIds: string[];
	ignoredRoleIds: string[];
};

export type RoleReward = {
	id: string;
	level: number;
	roleId: string | null;
	removePrevious: boolean;
};

export type LeaderboardEntry = {
	rank: number;
	name: string;
	initials: string;
	color: string;
	level: number;
	xp: number;
};

export type LevelsConfig = {
	enabled: boolean;
	xpMin: number;
	xpMax: number;
	cooldownSeconds: number;
	voiceXpPerMinute: number;
	curve: number;
	announce: boolean;
	announceChannelId: string | null;
	announceInPlace: boolean;
	announceMessage: MessageDraft;
	rewards: RoleReward[];
	noXpChannelIds: string[];
	noXpRoleIds: string[];
};

export type ShopItem = {
	id: string;
	name: string;
	description: string;
	price: number;
	roleId: string | null;
	stock: number | null;
	perUserLimit: number | null;
};

export type TransactionKind = 'daily' | 'work' | 'transfer' | 'purchase' | 'admin';

export type Transaction = {
	id: string;
	kind: TransactionKind;
	actorName: string;
	actorInitials: string;
	actorColor: string;
	amount: number;
	note: string;
	at: string;
};

export type EconomyConfig = {
	enabled: boolean;
	currencyName: string;
	currencySymbol: string;
	startingBalance: number;
	dailyAmount: number;
	dailyCooldownHours: number;
	workAmount: number;
	workCooldownMinutes: number;
	streakBonus: number;
	transferTaxPercent: number;
	shop: ShopItem[];
};

export type TicketPanel = {
	id: string;
	name: string;
	channelId: string | null;
	categoryId: string | null;
	staffRoleIds: string[];
	namingPattern: string;
	maxOpenPerUser: number;
	buttonLabel: string;
	buttonEmoji: string | null;
	enabled: boolean;
	message: MessageDraft;
};

export type TicketStatus = 'open' | 'claimed' | 'closed' | 'archived';

export type OpenTicket = {
	id: string;
	number: number;
	subject: string;
	openerName: string;
	openerInitials: string;
	openerColor: string;
	claimedBy: string | null;
	openedAt: string;
	status: TicketStatus;
};

export type TicketsConfig = {
	enabled: boolean;
	panels: TicketPanel[];
	transcriptChannelId: string | null;
	autoCloseHours: number;
	askForRating: boolean;
	closeDelaySeconds: number;
};

export type ReactionMode = 'toggle' | 'unique' | 'verify' | 'drop';

export type ReactionOption = {
	id: string;
	emoji: string;
	roleId: string | null;
	label: string;
	description: string;
};

export type ReactionPanel = {
	id: string;
	name: string;
	channelId: string | null;
	mode: ReactionMode;
	useButtons: boolean;
	options: ReactionOption[];
};

export type ReactionRolesConfig = {
	enabled: boolean;
	panels: ReactionPanel[];
};

export type GiveawayState = 'active' | 'scheduled' | 'ended';

export type Giveaway = {
	id: string;
	prize: string;
	winners: number;
	entries: number;
	hostName: string;
	hostInitials: string;
	hostColor: string;
	state: GiveawayState;
	endsInSeconds: number;
	startsIn: string;
	wonBy: string[];
	requiredRoleIds: string[];
	requiredLevel: number;
};

export type GiveawaysConfig = {
	enabled: boolean;
	giveaways: Giveaway[];
	defaultWinners: number;
	dmWinners: boolean;
};

export type CustomCommand = {
	id: string;
	name: string;
	description: string;
	uses: number;
	ephemeral: boolean;
	enabled: boolean;
	requiredRoleIds: string[];
	response: MessageDraft;
};

export type CustomCommandsConfig = {
	enabled: boolean;
	commands: CustomCommand[];
};

export type ScheduleKind = 'once' | 'recurring';

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type ScheduledMessage = {
	id: string;
	name: string;
	channelId: string | null;
	kind: ScheduleKind;
	runAt: string;
	days: Weekday[];
	timeOfDay: string;
	enabled: boolean;
	message: MessageDraft;
};

export type ScheduledConfig = {
	enabled: boolean;
	timezone: string;
	messages: ScheduledMessage[];
};
