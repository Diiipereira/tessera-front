export type ChannelKind = 'text' | 'voice' | 'announcement' | 'forum';

export type Channel = {
	id: string;
	name: string;
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
