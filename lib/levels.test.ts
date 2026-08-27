import { describe, expect, it } from 'vitest';
import { buildCurve, estimateTimeToLevel, messagesToReach, totalXpForLevel } from './levels';

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

describe('estimateTimeToLevel', () => {
	it('uses minutes for a short climb', () => {
		expect(estimateTimeToLevel(1, 10, 20, 20, 60)).toContain('min');
	});

	it('switches to days for a long one', () => {
		expect(estimateTimeToLevel(50, 200, 15, 25, 60)).toContain('days');
	});

	it('does not divide by zero on a zero cooldown', () => {
		expect(() => estimateTimeToLevel(10, 100, 15, 25, 0)).not.toThrow();
	});
});
