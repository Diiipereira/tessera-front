import { describe, expect, it } from 'vitest';
import { buildCurve, effortToLevel, messagesToReach, totalXpForLevel } from './levels';

const CONTRACT: readonly { curve: number; level: number; totalXp: number }[] = [
	{ curve: 100, level: 1, totalXp: 100 },
	{ curve: 100, level: 5, totalXp: 2500 },
	{ curve: 100, level: 20, totalXp: 40_000 },
	{ curve: 100, level: 50, totalXp: 250_000 },
	{ curve: 10, level: 30, totalXp: 9000 },
	{ curve: 55, level: 7, totalXp: 2695 },
	{ curve: 500, level: 12, totalXp: 72_000 }
];

describe('the curve the bot also runs', () => {
	it.each(CONTRACT)(
		'puts level $level of curve $curve at $totalXp xp',
		({ curve, level, totalXp }) => {
			expect(totalXpForLevel(level, curve)).toBe(totalXp);
		}
	);
});

describe('totalXpForLevel', () => {
	it('costs nothing to be level 0', () => {
		expect(totalXpForLevel(0, 100)).toBe(0);
	});

	it('is quadratic — doubling the level costs four times the XP', () => {
		expect(totalXpForLevel(10, 100)).toBe(totalXpForLevel(5, 100) * 4);
	});

	it('scales linearly with the curve setting', () => {
		expect(totalXpForLevel(7, 200)).toBe(totalXpForLevel(7, 100) * 2);
	});

	it('never goes negative for a nonsense level', () => {
		expect(totalXpForLevel(-3, 100)).toBe(0);
	});
});

describe('buildCurve', () => {
	it('returns one point per level, starting at 1', () => {
		const points = buildCurve(5, 100);
		expect(points).toHaveLength(5);
		expect(points[0]?.level).toBe(1);
		expect(points.at(-1)?.level).toBe(5);
	});

	it('never gets cheaper as the level rises', () => {
		const points = buildCurve(30, 100);
		for (let index = 1; index < points.length; index += 1) {
			const previous = points[index - 1];
			const current = points[index];
			expect(current?.totalXp ?? 0).toBeGreaterThan(previous?.totalXp ?? 0);
			expect(current?.xpFromPrevious ?? 0).toBeGreaterThanOrEqual(previous?.xpFromPrevious ?? 0);
		}
	});

	it('reports the step between levels, not just the total', () => {
		const points = buildCurve(3, 100);
		expect(points[0]?.xpFromPrevious).toBe(100);
		expect(points[1]?.xpFromPrevious).toBe(300);
	});
});

describe('messagesToReach', () => {
	it('divides by the average award', () => {
		expect(messagesToReach(2, 100, 10, 30)).toBe(20);
	});

	it('rounds up, because a partial message earns nothing', () => {
		expect(messagesToReach(1, 100, 30, 30)).toBe(4);
	});

	it('returns 0 rather than Infinity when no XP is awarded', () => {
		expect(messagesToReach(10, 100, 0, 0)).toBe(0);
	});
});

describe('effortToLevel', () => {
	it('uses minutes for a short climb', () => {
		expect(effortToLevel(1, 10, 20, 20, 60).unit).toBe('minutes');
	});

	it('switches to days for a long one', () => {
		expect(effortToLevel(50, 200, 15, 25, 60).unit).toBe('days');
	});

	it('does not divide by zero on a zero cooldown', () => {
		expect(() => effortToLevel(10, 100, 15, 25, 0)).not.toThrow();
	});

	it('reports a whole amount, so no language has to round it', () => {
		const effort = effortToLevel(20, 100, 15, 25, 60);

		expect(Number.isInteger(effort.amount)).toBe(true);
		expect(effort.amount).toBeGreaterThan(0);
	});
});
