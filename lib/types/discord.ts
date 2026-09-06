export type ChannelKind = 'text' | 'voice' | 'announcement' | 'forum' | 'category';

export type LockedReason = 'managed' | 'aboveBot' | 'noAccess';

export type Channel = {
	id: string;
	name: string;
	categoryId: string | null;
	category: string | null;
	kind: ChannelKind;
	locked?: LockedReason;
};

export type Role = {
	id: string;
	name: string;
	color: string;
	memberCount?: number;
	locked?: LockedReason;
};
