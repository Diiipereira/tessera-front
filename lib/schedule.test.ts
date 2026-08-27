import { describe, expect, it } from 'vitest';
import { describeSchedule, nextRuns, toCron } from './schedule';
import type { ScheduledMessage } from './types/module-configs';

function message(overrides: Partial<ScheduledMessage> = {}): ScheduledMessage {
	return {
		id: 'm',
		name: 'Test',
		channelId: null,
		kind: 'recurring',
		runAt: '',
		days: ['mon'],
		timeOfDay: '09:00',
		enabled: true,
		message: {
			mode: 'text',
			text: '',
			embed: {
				authorName: '',
				title: '',
				description: '',
				color: '#000000',
				fields: [],
				imageUrl: '',
				thumbnailUrl: '',
				footerText: '',
				timestamp: false
			}
		},
		...overrides
	};
}

describe('toCron', () => {
	it('puts minute and hour in the right fields', () => {
		expect(toCron(['mon'], '09:30')).toBe('30 9 * * 1');
	});

	it('strips the leading zero from the hour', () => {
		expect(toCron(['tue'], '07:05')).toBe('5 7 * * 2');
	});

	it('sorts days numerically rather than by the order they were clicked', () => {
		expect(toCron(['fri', 'mon', 'wed'], '12:00')).toBe('0 12 * * 1,3,5');
	});

	it('uses the wildcard when every day is picked', () => {
		expect(toCron(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], '08:00')).toBe('0 8 * * *');
	});

	it('uses the wildcard rather than an empty field when no day is picked', () => {
		expect(toCron([], '08:00')).toBe('0 8 * * *');
	});

	it('maps Sunday to 0, the way cron does', () => {
		expect(toCron(['sun'], '00:00')).toBe('0 0 * * 0');
	});
});

describe('describeSchedule', () => {
	it('spells out a weekly schedule in words', () => {
		expect(describeSchedule(message({ days: ['fri'], timeOfDay: '19:00' }))).toBe(
			'Friday at 19:00'
		);
	});

	it('collapses a full week to "every day"', () => {
		const every = message({ days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] });
		expect(describeSchedule(every)).toBe('Every day at 09:00');
	});

	it('says plainly when no day is picked', () => {
		expect(describeSchedule(message({ days: [] }))).toBe('No days picked');
	});

	it('says plainly when a one-off has no date', () => {
		expect(describeSchedule(message({ kind: 'once', runAt: '' }))).toBe('No date set');
	});

	it('reads a one-off date back', () => {
		expect(describeSchedule(message({ kind: 'once', runAt: '2026-09-02T22:00' }))).toContain(
			'2026-09-02 at 22:00'
		);
	});
});

describe('nextRuns', () => {
	it('lists the requested number of runs', () => {
		expect(nextRuns(message({ days: ['mon', 'thu'] }), 3)).toHaveLength(3);
	});

	it('wraps into following weeks rather than repeating the same wording', () => {
		const runs = nextRuns(message({ days: ['mon'] }), 3);
		expect(new Set(runs).size).toBe(3);
	});

	it('returns nothing when there is no day to run on', () => {
		expect(nextRuns(message({ days: [] }))).toEqual([]);
	});

	it('returns the single date for a one-off', () => {
		expect(nextRuns(message({ kind: 'once', runAt: '2026-09-02T22:00' }))).toHaveLength(1);
	});

	it('terminates on an impossible schedule', () => {
		expect(nextRuns(message({ days: [] }), 50)).toEqual([]);
	});
});
