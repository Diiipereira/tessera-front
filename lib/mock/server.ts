import type { BillingState, GuildSettings } from '@/lib/types/management';

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
	botNickname: ''
};
