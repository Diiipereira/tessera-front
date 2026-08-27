import type { Member } from '@/lib/types/management';

const MEMBER = '801234567890123001';
const VERIFIED = '801234567890123002';
const BOOSTER = '801234567890123003';
const EVENT_HOST = '801234567890123004';
const ADMIN = '801234567890123010';
const STAFF = '801234567890123011';
const TRIAL_MOD = '801234567890123012';

export const mockMembers: Member[] = [
	{
		id: '304918273645102938',
		name: 'lia',
		handle: '@lia.exe',
		initials: 'L',
		color: '#fbbf24',
		joinedAt: '2024-02-11T09:15:00.000Z',
		lastSeenAt: '2026-08-25T18:12:00.000Z',
		level: 42,
		xp: 184320,
		balance: 12480,
		messages: 28417,
		standing: 'clean',
		roleIds: [MEMBER, VERIFIED, ADMIN, STAFF],
		infractions: [],
		notes: [
			{
				id: 'n1',
				author: 'okra',
				body: 'Server owner. Every other seat is granted by her.',
				at: '2024-02-11T09:20:00.000Z'
			}
		]
	},
	{
		id: '512038475610293847',
		name: 'okra',
		handle: '@okra',
		initials: 'O',
		color: '#8b5cf6',
		joinedAt: '2024-03-02T14:40:00.000Z',
		lastSeenAt: '2026-08-25T17:02:00.000Z',
		level: 38,
		xp: 151200,
		balance: 8210,
		messages: 21044,
		standing: 'clean',
		roleIds: [MEMBER, VERIFIED, STAFF],
		infractions: [],
		notes: []
	},
	{
		id: '628374651029384756',
		name: 'panela',
		handle: '@panela.dev',
		initials: 'P',
		color: '#22d3ee',
		joinedAt: '2024-06-19T20:05:00.000Z',
		lastSeenAt: '2026-08-25T16:44:00.000Z',
		level: 31,
		xp: 99820,
		balance: 4390,
		messages: 14882,
		standing: 'warned',
		roleIds: [MEMBER, VERIFIED, BOOSTER],
		infractions: [
			{
				id: 'i1',
				caseNumber: 38,
				action: 'warn',
				reason: 'Spoilers outside the spoiler channel.',
				moderator: 'okra',
				at: '2026-07-14T22:10:00.000Z'
			}
		],
		notes: []
	},
	{
		id: '739485610293847561',
		name: 'nimbus',
		handle: '@nimbus',
		initials: 'N',
		color: '#34d399',
		joinedAt: '2025-01-08T11:30:00.000Z',
		lastSeenAt: '2026-08-25T13:20:00.000Z',
		level: 27,
		xp: 74300,
		balance: 2140,
		messages: 9931,
		standing: 'clean',
		roleIds: [MEMBER, VERIFIED, EVENT_HOST],
		infractions: [],
		notes: [
			{
				id: 'n2',
				author: 'lia',
				body: 'Runs the Friday events. Give her Event Host back if it drops.',
				at: '2025-04-02T18:00:00.000Z'
			}
		]
	},
	{
		id: '840596710293847562',
		name: 'brisa',
		handle: '@brisa',
		initials: 'B',
		color: '#f472b6',
		joinedAt: '2025-03-21T08:12:00.000Z',
		lastSeenAt: '2026-08-25T11:05:00.000Z',
		level: 24,
		xp: 58720,
		balance: 1875,
		messages: 8204,
		standing: 'clean',
		roleIds: [MEMBER, VERIFIED, TRIAL_MOD],
		infractions: [],
		notes: []
	},
	{
		id: '951607810293847563',
		name: 'tigre',
		handle: '@tigre.9',
		initials: 'T',
		color: '#fb923c',
		joinedAt: '2025-05-30T19:48:00.000Z',
		lastSeenAt: '2026-08-24T21:37:00.000Z',
		level: 21,
		xp: 44980,
		balance: 960,
		messages: 6120,
		standing: 'timed-out',
		roleIds: [MEMBER, VERIFIED],
		infractions: [
			{
				id: 'i2',
				caseNumber: 41,
				action: 'warn',
				reason: 'Arguing with staff in #general.',
				moderator: 'brisa',
				at: '2026-08-19T20:15:00.000Z'
			},
			{
				id: 'i3',
				caseNumber: 44,
				action: 'timeout',
				reason: 'Kept going after the warning.',
				moderator: 'okra',
				at: '2026-08-25T16:00:00.000Z'
			}
		],
		notes: [
			{
				id: 'n3',
				author: 'brisa',
				body: 'Next one is a mute, not another warning.',
				at: '2026-08-19T20:20:00.000Z'
			}
		]
	},
	{
		id: '162718910293847564',
		name: 'vela',
		handle: '@vela',
		initials: 'V',
		color: '#a78bfa',
		joinedAt: '2025-07-14T15:22:00.000Z',
		lastSeenAt: '2026-08-25T09:41:00.000Z',
		level: 18,
		xp: 33100,
		balance: 720,
		messages: 4471,
		standing: 'clean',
		roleIds: [MEMBER, VERIFIED, BOOSTER],
		infractions: [],
		notes: []
	},
	{
		id: '273829010293847565',
		name: 'corvo',
		handle: '@corvo.exe',
		initials: 'C',
		color: '#94a3b8',
		joinedAt: '2025-09-02T07:03:00.000Z',
		lastSeenAt: '2026-08-23T14:18:00.000Z',
		level: 15,
		xp: 23400,
		balance: 410,
		messages: 3188,
		standing: 'warned',
		roleIds: [MEMBER, VERIFIED],
		infractions: [
			{
				id: 'i4',
				caseNumber: 40,
				action: 'warn',
				reason: 'Self-promo link in #screenshots.',
				moderator: 'brisa',
				at: '2026-08-02T13:44:00.000Z'
			}
		],
		notes: []
	},
	{
		id: '384930110293847566',
		name: 'mare',
		handle: '@mare',
		initials: 'M',
		color: '#38bdf8',
		joinedAt: '2025-11-18T22:55:00.000Z',
		lastSeenAt: '2026-08-25T08:02:00.000Z',
		level: 12,
		xp: 15600,
		balance: 285,
		messages: 2044,
		standing: 'clean',
		roleIds: [MEMBER, VERIFIED],
		infractions: [],
		notes: []
	},
	{
		id: '495041210293847567',
		name: 'jaca',
		handle: '@jaca',
		initials: 'J',
		color: '#facc15',
		joinedAt: '2026-01-27T12:10:00.000Z',
		lastSeenAt: '2026-08-22T19:30:00.000Z',
		level: 9,
		xp: 8900,
		balance: 140,
		messages: 1102,
		standing: 'clean',
		roleIds: [MEMBER, VERIFIED],
		infractions: [],
		notes: []
	},
	{
		id: '506152310293847568',
		name: 'quartzo',
		handle: '@quartzo',
		initials: 'Q',
		color: '#e879f9',
		joinedAt: '2026-04-05T17:25:00.000Z',
		lastSeenAt: '2026-08-25T07:14:00.000Z',
		level: 6,
		xp: 3900,
		balance: 60,
		messages: 488,
		standing: 'clean',
		roleIds: [MEMBER],
		infractions: [],
		notes: []
	},
	{
		id: '617263410293847569',
		name: 'ruido',
		handle: '@ruido',
		initials: 'R',
		color: '#ef4444',
		joinedAt: '2026-07-30T03:41:00.000Z',
		lastSeenAt: '2026-08-21T02:19:00.000Z',
		level: 2,
		xp: 420,
		balance: 0,
		messages: 61,
		standing: 'banned',
		roleIds: [],
		infractions: [
			{
				id: 'i5',
				caseNumber: 42,
				action: 'warn',
				reason: 'Discord invite in DMs to five members.',
				moderator: 'okra',
				at: '2026-08-20T23:55:00.000Z'
			},
			{
				id: 'i6',
				caseNumber: 43,
				action: 'ban',
				reason: 'Kept advertising after the warning.',
				moderator: 'lia',
				at: '2026-08-21T03:02:00.000Z'
			}
		],
		notes: [
			{
				id: 'n4',
				author: 'lia',
				body: 'Alt of a banned account. Same join pattern.',
				at: '2026-08-21T03:05:00.000Z'
			}
		]
	},
	{
		id: '728374510293847570',
		name: 'pluma',
		handle: '@pluma',
		initials: 'P',
		color: '#5eead4',
		joinedAt: '2026-08-12T10:08:00.000Z',
		lastSeenAt: '2026-08-25T18:20:00.000Z',
		level: 1,
		xp: 140,
		balance: 100,
		messages: 22,
		standing: 'clean',
		roleIds: [MEMBER],
		infractions: [],
		notes: []
	},
	{
		id: '839485610293847571',
		name: 'novato',
		handle: '@novato',
		initials: 'N',
		color: '#60a5fa',
		joinedAt: '2026-08-25T17:58:00.000Z',
		lastSeenAt: '2026-08-25T18:28:00.000Z',
		level: 1,
		xp: 20,
		balance: 100,
		messages: 3,
		standing: 'clean',
		roleIds: [MEMBER],
		infractions: [],
		notes: []
	}
];
