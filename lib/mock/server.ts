import type { BillingState, GuildSettings, TeamInvite, TeamMember } from '@/lib/types/management';

export const mockTeam: TeamMember[] = [
	{
		id: '304918273645102938',
		name: 'lia',
		handle: '@lia.exe',
		initials: 'L',
		color: '#fbbf24',
		role: 'owner',
		grantedBy: 'Discord',
		grantedAt: '2024-02-11T09:15:00.000Z',
		lastSeenAt: '2026-08-25T18:12:00.000Z',
		viaDiscord: true
	},
	{
		id: '512038475610293847',
		name: 'okra',
		handle: '@okra',
		initials: 'O',
		color: '#8b5cf6',
		role: 'admin',
		grantedBy: 'lia',
		grantedAt: '2024-03-05T10:00:00.000Z',
		lastSeenAt: '2026-08-25T17:02:00.000Z',
		viaDiscord: false
	},
	{
		id: '840596710293847562',
		name: 'brisa',
		handle: '@brisa',
		initials: 'B',
		color: '#f472b6',
		role: 'moderator',
		grantedBy: 'lia',
		grantedAt: '2026-08-23T15:12:00.000Z',
		lastSeenAt: '2026-08-25T11:05:00.000Z',
		viaDiscord: false
	},
	{
		id: '739485610293847561',
		name: 'nimbus',
		handle: '@nimbus',
		initials: 'N',
		color: '#34d399',
		role: 'moderator',
		grantedBy: 'Manage Server',
		grantedAt: '2025-01-08T11:30:00.000Z',
		lastSeenAt: '2026-08-25T13:20:00.000Z',
		viaDiscord: true
	},
	{
		id: '628374651029384756',
		name: 'panela',
		handle: '@panela.dev',
		initials: 'P',
		color: '#22d3ee',
		role: 'viewer',
		grantedBy: 'okra',
		grantedAt: '2026-05-02T19:44:00.000Z',
		lastSeenAt: '2026-08-25T16:44:00.000Z',
		viaDiscord: false
	}
];

export const mockInvites: TeamInvite[] = [
	{
		id: 'inv-1',
		handle: '@vela',
		role: 'moderator',
		invitedBy: 'lia',
		invitedAt: '2026-08-24T10:15:00.000Z'
	},
	{
		id: 'inv-2',
		handle: '@corvo.exe',
		role: 'viewer',
		invitedBy: 'okra',
		invitedAt: '2026-08-20T16:02:00.000Z'
	}
];

export const mockBilling: BillingState = {
	tier: 'pro',
	cycle: 'monthly',
	renewsAt: '2026-09-11T00:00:00.000Z',
	cancelAtPeriodEnd: false,
	daysLeftInPeriod: 17,
	daysInPeriod: 31,
	paymentMethod: { brand: 'Visa', last4: '4242', expiry: '09/28' },
	usage: [
		{ limitId: 'automod-rules', value: 17 },
		{ limitId: 'custom-commands', value: 34 },
		{ limitId: 'ticket-panels', value: 2 },
		{ limitId: 'scheduled', value: 24 },
		{ limitId: 'audit-retention', value: 365 }
	],
	invoices: [
		{
			id: 'in-8',
			number: 'TSR-2026-0812',
			at: '2026-08-11T00:00:00.000Z',
			amountCents: 599,
			status: 'paid',
			description: 'Pro plan — monthly'
		},
		{
			id: 'in-7',
			number: 'TSR-2026-0711',
			at: '2026-07-11T00:00:00.000Z',
			amountCents: 599,
			status: 'paid',
			description: 'Pro plan — monthly'
		},
		{
			id: 'in-6',
			number: 'TSR-2026-0611',
			at: '2026-06-11T00:00:00.000Z',
			amountCents: 599,
			status: 'paid',
			description: 'Pro plan — monthly'
		},
		{
			id: 'in-5',
			number: 'TSR-2026-0511',
			at: '2026-05-11T00:00:00.000Z',
			amountCents: 599,
			status: 'refunded',
			description: 'Pro plan — monthly (outage credit)'
		},
		{
			id: 'in-4',
			number: 'TSR-2026-0411',
			at: '2026-04-11T00:00:00.000Z',
			amountCents: 599,
			status: 'paid',
			description: 'Pro plan — monthly'
		},
		{
			id: 'in-3',
			number: 'TSR-2026-0311',
			at: '2026-03-11T00:00:00.000Z',
			amountCents: 599,
			status: 'paid',
			description: 'Pro plan — monthly'
		}
	]
};

export const mockGuildSettings: GuildSettings = {
	locale: 'en-US',
	timezone: 'America/Sao_Paulo',
	embedColor: '#5865f2',
	botNickname: '',
	legacyPrefix: '!',
	deleteCommandReplies: false,
	dmOnFailure: true
};
