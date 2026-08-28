export type TrendDirection = 'up' | 'down' | 'flat';

export type Stat = {
	id: string;
	value: string;
	delta: string;
	direction: TrendDirection;
};

export type ActivityRange = '7d' | '30d' | '90d';

export type ActivityPoint = {
	index: number;
	label: string;
	messages: number;
	commands: number;
	joins: number;
};

export type BotHealth = {
	online: boolean;
	uptime: string;
	latencyMs: number;
	shard: string;
	warnings: string[];
};

export type ActivitySource = 'web' | 'slash' | 'api';

export type ActivityEntry = {
	id: string;
	actorName: string;
	actorInitials: string;
	actorColor: string;
	action: string;
	target: string;
	source: ActivitySource;
	at: string;
};

export type SetupChecklistItem = {
	id: string;
	done: boolean;
	path: string;
};
