import { describe, expect, it } from 'vitest';
import {
	findPlan,
	formatPrice,
	limitFor,
	monthlyEquivalentCents,
	PLANS,
	prorationCents,
	yearlySavingsPercent
} from '@/lib/billing';

describe('findPlan', () => {
	it('finds each tier the app can be on', () => {
		expect(findPlan('pro').name).toBe('Pro');
		expect(findPlan('free').monthlyCents).toBe(0);
	});
});

describe('formatPrice', () => {
	it('says Free rather than $0.00', () => {
		expect(formatPrice(0)).toBe('Free');
	});

	it('keeps both cents digits', () => {
		expect(formatPrice(599)).toBe('$5.99');
		expect(formatPrice(1500)).toBe('$15.00');
	});
});

describe('monthlyEquivalentCents', () => {
	it('divides the yearly price so the cards compare like with like', () => {
		const pro = findPlan('pro');
		expect(monthlyEquivalentCents(pro, 'monthly')).toBe(599);
		expect(monthlyEquivalentCents(pro, 'yearly')).toBe(Math.round(5990 / 12));
	});
});

describe('yearlySavingsPercent', () => {
	it('is the two free months the yearly price is built on', () => {
		expect(yearlySavingsPercent(findPlan('pro'))).toBe(17);
	});

	it('is zero for a plan that costs nothing, not a division by zero', () => {
		expect(yearlySavingsPercent(findPlan('free'))).toBe(0);
	});
});

describe('prorationCents', () => {
	const free = findPlan('free');
	const pro = findPlan('pro');
	const ultimate = findPlan('ultimate');

	it('charges the unused share of the difference when moving up', () => {
		const cents = prorationCents(pro, ultimate, 'monthly', 17, 31);
		expect(cents).toBe(Math.round(1499 * (17 / 31)) - Math.round(599 * (17 / 31)));
		expect(cents).toBeGreaterThan(0);
	});

	it('returns a credit as a negative number when moving down', () => {
		expect(prorationCents(ultimate, pro, 'monthly', 17, 31)).toBeLessThan(0);
	});

	it('charges nothing when the period has just rolled over', () => {
		expect(prorationCents(pro, ultimate, 'monthly', 0, 31)).toBe(0);
	});

	it('charges the full difference when the whole period is still ahead', () => {
		expect(prorationCents(free, pro, 'monthly', 31, 31)).toBe(599);
	});

	it('does not blow up on a zero-length period', () => {
		expect(prorationCents(pro, ultimate, 'monthly', 5, 0)).toBe(0);
	});

	it('clamps days left above the period length', () => {
		expect(prorationCents(free, pro, 'monthly', 90, 31)).toBe(599);
	});
});

describe('plan limits', () => {
	it('gives every plan the same limit ids so the usage meters always resolve', () => {
		const ids = PLANS.map((plan) =>
			plan.limits
				.map((limit) => limit.id)
				.sort()
				.join(',')
		);
		expect(new Set(ids).size).toBe(1);
	});

	it('marks the top plan uncapped rather than using a large number', () => {
		expect(limitFor(findPlan('ultimate'), 'automod-rules')?.max).toBeNull();
	});

	it('never lets a cheaper plan allow more than a dearer one', () => {
		const free = findPlan('free');
		const pro = findPlan('pro');

		for (const limit of free.limits) {
			const paid = limitFor(pro, limit.id);
			if (limit.max === null || paid?.max === null || paid === undefined) continue;
			expect(paid.max).toBeGreaterThanOrEqual(limit.max);
		}
	});
});

describe('limit kinds', () => {
	it('marks audit retention as an allowance, so it never renders as a full bar', () => {
		expect(limitFor(findPlan('pro'), 'audit-retention')?.kind).toBe('allowance');
	});

	it('marks the countable limits as quotas', () => {
		for (const id of ['automod-rules', 'custom-commands', 'ticket-panels', 'scheduled']) {
			expect(limitFor(findPlan('pro'), id)?.kind).toBe('quota');
		}
	});

	it('keeps the kind of a limit the same across every plan', () => {
		for (const limit of PLANS[0]?.limits ?? []) {
			for (const plan of PLANS) {
				expect(limitFor(plan, limit.id)?.kind).toBe(limit.kind);
			}
		}
	});
});
