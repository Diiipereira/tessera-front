import type { PlanTier } from '@/lib/types/billing';
import type { BillingCycle } from '@/lib/types/management';

export type LimitKind = 'quota' | 'allowance';

export type PlanLimit = {
	id: string;
	label: string;
	max: number | null;
	kind: LimitKind;
	unit?: string;
};

export type PlanDefinition = {
	tier: PlanTier;
	name: string;
	blurb: string;
	monthlyCents: number;
	yearlyCents: number;
	features: string[];
	limits: PlanLimit[];
};

export const PLANS: PlanDefinition[] = [
	{
		tier: 'free',
		name: 'Free',
		blurb: 'Everything a small server needs to run itself.',
		monthlyCents: 0,
		yearlyCents: 0,
		features: ['Every core module', 'Community support', '30 days of audit history'],
		limits: [
			{ id: 'automod-rules', label: 'AutoMod rules', max: 5, kind: 'quota' },
			{ id: 'custom-commands', label: 'Custom commands', max: 10, kind: 'quota' },
			{ id: 'ticket-panels', label: 'Ticket panels', max: 1, kind: 'quota' },
			{ id: 'scheduled', label: 'Scheduled messages', max: 0, kind: 'quota' },
			{ id: 'audit-retention', label: 'Audit retention', max: 30, kind: 'allowance', unit: 'days' }
		]
	},
	{
		tier: 'pro',
		name: 'Pro',
		blurb: 'For servers where staff work in shifts.',
		monthlyCents: 599,
		yearlyCents: 5990,
		features: [
			'Economy and Scheduled messages',
			'Embed builder',
			'Priority support',
			'365 days of audit history'
		],
		limits: [
			{ id: 'automod-rules', label: 'AutoMod rules', max: 20, kind: 'quota' },
			{ id: 'custom-commands', label: 'Custom commands', max: 100, kind: 'quota' },
			{ id: 'ticket-panels', label: 'Ticket panels', max: 5, kind: 'quota' },
			{ id: 'scheduled', label: 'Scheduled messages', max: 25, kind: 'quota' },
			{ id: 'audit-retention', label: 'Audit retention', max: 365, kind: 'allowance', unit: 'days' }
		]
	},
	{
		tier: 'ultimate',
		name: 'Ultimate',
		blurb: 'No ceilings, and a person to call.',
		monthlyCents: 1499,
		yearlyCents: 14990,
		features: [
			'Everything in Pro, uncapped',
			'Custom bot name and avatar',
			'API access',
			'Dedicated support channel'
		],
		limits: [
			{ id: 'automod-rules', label: 'AutoMod rules', max: null, kind: 'quota' },
			{ id: 'custom-commands', label: 'Custom commands', max: null, kind: 'quota' },
			{ id: 'ticket-panels', label: 'Ticket panels', max: null, kind: 'quota' },
			{ id: 'scheduled', label: 'Scheduled messages', max: null, kind: 'quota' },
			{
				id: 'audit-retention',
				label: 'Audit retention',
				max: null,
				kind: 'allowance',
				unit: 'days'
			}
		]
	}
];

export function findPlan(tier: PlanTier): PlanDefinition {
	const plan = PLANS.find((entry) => entry.tier === tier);
	if (!plan) throw new Error(`Unknown plan tier: ${tier}`);
	return plan;
}

export function cycleTotalCents(plan: PlanDefinition, cycle: BillingCycle): number {
	return cycle === 'yearly' ? plan.yearlyCents : plan.monthlyCents;
}

export function monthlyEquivalentCents(plan: PlanDefinition, cycle: BillingCycle): number {
	return cycle === 'yearly' ? Math.round(plan.yearlyCents / 12) : plan.monthlyCents;
}

export function yearlySavingsPercent(plan: PlanDefinition): number {
	if (plan.monthlyCents === 0) return 0;
	const full = plan.monthlyCents * 12;
	return Math.round(((full - plan.yearlyCents) / full) * 100);
}

export function formatPrice(cents: number): string {
	if (cents === 0) return 'Free';
	return `$${(cents / 100).toFixed(2)}`;
}

export function prorationCents(
	current: PlanDefinition,
	next: PlanDefinition,
	cycle: BillingCycle,
	daysLeft: number,
	daysInPeriod: number
): number {
	if (daysInPeriod <= 0) return 0;
	const slice = Math.min(Math.max(daysLeft, 0), daysInPeriod) / daysInPeriod;
	const credit = Math.round(cycleTotalCents(current, cycle) * slice);
	const charge = Math.round(cycleTotalCents(next, cycle) * slice);
	return charge - credit;
}

export function limitFor(plan: PlanDefinition, limitId: string): PlanLimit | undefined {
	return plan.limits.find((limit) => limit.id === limitId);
}
