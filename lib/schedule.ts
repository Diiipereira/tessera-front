import type { ScheduledMessage, Weekday } from '@/lib/types/module-configs';

export const WEEKDAYS: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export type Schedule =
	| { kind: 'no-date' }
	| { kind: 'once'; at: string }
	| { kind: 'no-days' }
	| { kind: 'daily'; time: string }
	| { kind: 'days'; days: Weekday[]; time: string };

export type SchedulePreview = Pick<ScheduledMessage, 'kind' | 'runAt' | 'days' | 'timeOfDay'>;

export function readSchedule(message: SchedulePreview): Schedule {
	if (message.kind === 'once') {
		return message.runAt === '' ? { kind: 'no-date' } : { kind: 'once', at: message.runAt };
	}
	if (message.days.length === 0) return { kind: 'no-days' };
	if (message.days.length === 7) return { kind: 'daily', time: message.timeOfDay };

	return {
		kind: 'days',
		days: WEEKDAYS.filter((day) => message.days.includes(day)),
		time: message.timeOfDay
	};
}

export type Run = { at: string } | { week: number; day: Weekday; time: string };

export function nextRuns(message: SchedulePreview, count = 3): Run[] {
	if (message.kind === 'once') {
		return message.runAt === '' ? [] : [{ at: message.runAt }];
	}
	if (message.days.length === 0) return [];

	const ordered = WEEKDAYS.filter((day) => message.days.includes(day));
	const runs: Run[] = [];
	let week = 0;

	while (runs.length < count) {
		for (const day of ordered) {
			if (runs.length >= count) break;
			runs.push({ week, day, time: message.timeOfDay });
		}
		week += 1;
	}

	return runs;
}
