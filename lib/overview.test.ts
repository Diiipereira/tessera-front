import { describe, expect, it } from 'vitest';
import {
	RANGE_DAYS,
	daysBefore,
	lastDays,
	netJoins,
	percentTrend,
	sumOf,
	toActivity,
	toChecklist,
	trendOf,
	uptimeOf,
	type DayPointDto
} from './overview';

const point = (day: string, patch: Partial<DayPointDto> = {}): DayPointDto => ({
	day,
	messages: 0,
	commands: 0,
	joins: 0,
	leaves: 0,
	modActions: 0,
	ticketsOpened: 0,
	...patch
});

const series = (days: number, patch: (index: number) => Partial<DayPointDto> = () => ({})) =>
	Array.from({ length: days }, (_unused, index) =>
		point(`2026-06-${String(index + 1).padStart(2, '0')}`, patch(index))
	);

describe('slicing the series', () => {
	it('takes the most recent days, because the chart reads left to right', () => {
		expect(lastDays(series(10), 3).map((one) => one.day)).toEqual([
			'2026-06-08',
			'2026-06-09',
			'2026-06-10'
		]);
	});

	it('takes the window before that one, for the comparison', () => {
		expect(daysBefore(series(10), 3).map((one) => one.day)).toEqual([
			'2026-06-05',
			'2026-06-06',
			'2026-06-07'
		]);
	});

	it('gives back what it has when the guild is younger than the window', () => {
		expect(lastDays(series(2), 7)).toHaveLength(2);
		expect(daysBefore(series(2), 7)).toEqual([]);
	});

	it('never overlaps the two windows, which would count a day twice', () => {
		const current = lastDays(series(30), 7);
		const previous = daysBefore(series(30), 7);

		expect(current.some((one) => previous.some((other) => other.day === one.day))).toBe(false);
	});
});

describe('sumOf', () => {
	it('adds a metric across the window', () => {
		expect(
			sumOf(
				series(3, () => ({ commands: 4 })),
				'commands'
			)
		).toBe(12);
	});

	it('is zero on an empty window instead of undefined', () => {
		expect(sumOf([], 'messages')).toBe(0);
	});
});

describe('netJoins', () => {
	it('reads growth as the joins that stayed', () => {
		expect(netJoins([point('2026-06-01', { joins: 10, leaves: 4 })])).toBe(6);
	});

	it('reads a shrinking server as a negative number, not as zero', () => {
		expect(netJoins([point('2026-06-01', { joins: 1, leaves: 5 })])).toBe(-4);
	});
});

describe('trendOf', () => {
	it('points up when the week beat the one before', () => {
		expect(trendOf(10, 4)).toEqual({ amount: 6, direction: 'up' });
	});

	it('points down when it lost ground', () => {
		expect(trendOf(4, 10)).toEqual({ amount: -6, direction: 'down' });
	});

	it('stays flat on a tie, instead of guessing a direction', () => {
		expect(trendOf(7, 7)).toEqual({ amount: 0, direction: 'flat' });
	});
});

describe('percentTrend', () => {
	it('reads the change as a percentage of the week before', () => {
		expect(percentTrend(112, 100)).toEqual({ amount: 12, direction: 'up' });
	});

	it('says nothing when there is no week before to compare against', () => {
		expect(percentTrend(50, 0)).toBeNull();
	});
});

describe('toActivity', () => {
	it('builds every range the chart offers', () => {
		const activity = toActivity(series(90), (day) => day);

		expect(activity['7d']).toHaveLength(RANGE_DAYS['7d']);
		expect(activity['30d']).toHaveLength(RANGE_DAYS['30d']);
		expect(activity['90d']).toHaveLength(RANGE_DAYS['90d']);
	});

	it('numbers the points from zero, which is what the axis reads', () => {
		expect(toActivity(series(7), (day) => day)['7d'].map((one) => one.index)).toEqual([
			0, 1, 2, 3, 4, 5, 6
		]);
	});

	it('asks the caller for the label, so the words follow the locale', () => {
		const activity = toActivity(series(7), (day, range) => `${range}:${day}`);

		expect(activity['7d'][0]?.label).toBe('7d:2026-06-01');
	});

	it('carries only the three series the chart draws', () => {
		const activity = toActivity(
			[point('2026-06-01', { messages: 1, commands: 2, joins: 3 })],
			() => ''
		);

		expect(activity['7d'][0]).toEqual({ index: 0, label: '', messages: 1, commands: 2, joins: 3 });
	});
});

describe('toChecklist', () => {
	it('points each step at the screen that finishes it', () => {
		expect(toChecklist([{ key: 'welcome', done: false }])).toEqual([
			{ id: 'welcome', done: false, path: '/modules/welcome' }
		]);
	});

	it('keeps the order the API sent', () => {
		const checklist = toChecklist([
			{ key: 'welcome', done: true },
			{ key: 'moderation', done: false }
		]);

		expect(checklist.map((one) => one.id)).toEqual(['welcome', 'moderation']);
	});
});

describe('uptimeOf', () => {
	it('breaks the seconds into what a person reads', () => {
		expect(uptimeOf(9 * 86_400 + 4 * 3600 + 30 * 60)).toEqual({
			days: 9,
			hours: 4,
			minutes: 30
		});
	});

	it('reads a gateway that just came up as minutes, not as a day', () => {
		expect(uptimeOf(90)).toEqual({ days: 0, hours: 0, minutes: 1 });
	});

	it('never reports a negative uptime', () => {
		expect(uptimeOf(-10)).toEqual({ days: 0, hours: 0, minutes: 0 });
	});
});
