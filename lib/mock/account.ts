import type { AccountPreferences, AccountSession } from '@/lib/types/account';

export const mockAccountPreferences: AccountPreferences = {
	locale: 'en-US',
	emailOnMention: true,
	emailOnCase: false,
	emailProduct: false
};

export const mockAccountSessions: AccountSession[] = [
	{
		id: 's-1',
		deviceKind: 'desktop',
		device: 'Windows 11',
		browser: 'Chrome 141',
		location: 'São Paulo, BR',
		ip: '187.45.__.__',
		lastSeenAt: '2026-08-25T18:29:00.000Z',
		current: true
	},
	{
		id: 's-2',
		deviceKind: 'mobile',
		device: 'iPhone 16',
		browser: 'Safari 26',
		location: 'São Paulo, BR',
		ip: '187.45.__.__',
		lastSeenAt: '2026-08-25T08:41:00.000Z',
		current: false
	},
	{
		id: 's-3',
		deviceKind: 'desktop',
		device: 'macOS 26',
		browser: 'Firefox 145',
		location: 'Lisboa, PT',
		ip: '85.240.__.__',
		lastSeenAt: '2026-08-18T21:07:00.000Z',
		current: false
	},
	{
		id: 's-4',
		deviceKind: 'mobile',
		device: 'Android 16',
		browser: 'Chrome 141',
		location: 'Unknown',
		ip: '102.68.__.__',
		lastSeenAt: '2026-07-02T03:55:00.000Z',
		current: false
	}
];
