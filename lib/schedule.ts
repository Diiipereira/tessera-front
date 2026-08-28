import type { ScheduledMessage, Weekday } from '@/lib/types/module-configs';

const CRON_DAY: Record<Weekday, number> = {
	sun: 0,
	mon: 1,
	tue: 2,
	wed: 3,
	thu: 4,
	fri: 5,
	sat: 6
};

export const WEEKDAYS: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export function toCron(days: Weekday[], timeOfDay: string): string {
	const [hour = '0', minute = '0'] = timeOfDay.split(':');
	const dayField =
		days.length === 0 || days.length === 7
			? '*'
			: [...days]
					.map((day) => CRON_DAY[day])
					.sort((a, b) => a - b)
					.join(',');
	return `${String(Number(minute))} ${String(Number(hour))} * * ${dayField}`;
}

export type Schedule =
	| { kind: 'no-date' }
	| { kind: 'once'; at: string }
	| { kind: 'no-days' }
	| { kind: 'daily'; time: string }
	| { kind: 'days'; days: Weekday[]; time: string };

export function readSchedule(message: ScheduledMessage): Schedule {
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

export function nextRuns(message: ScheduledMessage, count = 3): Run[] {
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
