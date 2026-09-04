export type SessionDeviceKind = 'desktop' | 'mobile';

export type AccountSession = {
	id: string;
	deviceKind: SessionDeviceKind;
	device: string;
	browser: string;
	ip: string;
	lastSeenAt: string;
	current: boolean;
};

export type AccountPreferences = {
	emailOnMention: boolean;
	emailOnCase: boolean;
	emailProduct: boolean;
};
