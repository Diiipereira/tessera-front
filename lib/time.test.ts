import { describe, expect, it } from 'vitest';
import { absoluteTime, dateOnly, hasPassed, relativeTime, remaining } from '@/lib/time';

const NOW = new Date('2026-08-25T18:30:00.000Z');

describe('relativeTime', () => {
	it('collapses anything under 45 seconds to "just now"', () => {
		expect(relativeTime('2026-08-25T18:29:30.000Z', NOW)).toBe('just now');
		expect(relativeTime('2026-08-25T18:30:20.000Z', NOW)).toBe('just now');
	});

	it('reads the past with an "ago" suffix', () => {
		expect(relativeTime('2026-08-25T16:30:00.000Z', NOW)).toBe('2 hours ago');
	});

	it('reads the future with an "in" prefix', () => {
		expect(relativeTime('2026-08-26T18:30:00.000Z', NOW)).toBe('in 1 day');
	});

	it('does not throw on a value that is not a date', () => {
		expect(relativeTime('not-a-date', NOW)).toBe('unknown');
	});
});

describe('absoluteTime', () => {
	it('formats in UTC so the server and the browser agree', () => {
		expect(absoluteTime('2026-08-25T18:30:00.000Z')).toBe('25 Aug 2026, 18:30');
	});

	it('drops the clock for a date-only label', () => {
		expect(dateOnly('2026-08-25T18:30:00.000Z')).toBe('25 Aug 2026');
	});
});

describe('remaining', () => {
	it('measures forward to a future instant', () => {
		expect(remaining('2026-08-26T18:30:00.000Z', NOW)).toBe('1 day');
	});

	it('is null once the instant has passed', () => {
		expect(remaining('2026-08-24T18:30:00.000Z', NOW)).toBeNull();
	});

	it('is null for a permanent punishment', () => {
		expect(remaining(null, NOW)).toBeNull();
	});
});

describe('hasPassed', () => {
	it('is true for the past and false for the future', () => {
		expect(hasPassed('2026-08-24T00:00:00.000Z', NOW)).toBe(true);
		expect(hasPassed('2026-09-01T00:00:00.000Z', NOW)).toBe(false);
	});

	it('treats a null expiry as never passing', () => {
		expect(hasPassed(null, NOW)).toBe(false);
	});
});
