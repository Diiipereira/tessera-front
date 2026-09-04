import { describe, expect, it } from 'vitest';
import { nextRuns, readSchedule, type SchedulePreview } from './schedule';

function message(overrides: Partial<SchedulePreview> = {}): SchedulePreview {
	return {
		kind: 'recurring',
		runAt: '',
		days: ['mon'],
		timeOfDay: '09:00',
		...overrides
	};
}

describe('readSchedule', () => {
	it('names the days a weekly schedule runs on, in week order', () => {
		expect(readSchedule(message({ days: ['fri', 'mon'], timeOfDay: '19:00' }))).toEqual({
			kind: 'days',
			days: ['mon', 'fri'],
			time: '19:00'
		});
	});

	it('collapses a full week rather than listing seven days', () => {
		const every = message({ days: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] });
		expect(readSchedule(every)).toEqual({ kind: 'daily', time: '09:00' });
	});

	it('reports no day picked as its own case, not as an empty list', () => {
		expect(readSchedule(message({ days: [] }))).toEqual({ kind: 'no-days' });
	});

	it('reports a one-off with no date as its own case', () => {
		expect(readSchedule(message({ kind: 'once', runAt: '' }))).toEqual({ kind: 'no-date' });
	});

	it('hands back the stored one-off date untouched, for the screen to format', () => {
		expect(readSchedule(message({ kind: 'once', runAt: '2026-09-02T22:00' }))).toEqual({
			kind: 'once',
			at: '2026-09-02T22:00'
		});
	});

	it('carries no human wording, so a language cannot leak out of here', () => {
		const shapes = [
			readSchedule(message({ days: ['fri'] })),
			readSchedule(message({ days: [] })),
			readSchedule(message({ kind: 'once', runAt: '2026-09-02T22:00' }))
		];

		expect(JSON.stringify(shapes)).not.toMatch(/friday|every|no days|once, on/i);
	});
});

describe('nextRuns', () => {
	it('lists the requested number of runs', () => {
		expect(nextRuns(message({ days: ['mon', 'thu'] }), 3)).toHaveLength(3);
	});

	it('wraps into following weeks rather than repeating the same wording', () => {
		const runs = nextRuns(message({ days: ['mon'] }), 3);
		expect(new Set(runs.map((run) => JSON.stringify(run))).size).toBe(3);
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
