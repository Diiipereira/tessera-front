export type ChannelKind = 'text' | 'voice' | 'announcement' | 'forum' | 'category';

export type Channel = {
	id: string;
	name: string;
	categoryId: string | null;
	category: string;
	kind: ChannelKind;
	lockedReason?: string;
};

export type Role = {
	id: string;
	name: string;
	color: string;
	memberCount?: number;
	lockedReason?: string;
};
