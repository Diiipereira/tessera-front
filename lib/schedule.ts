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

export const WEEKDAYS: { id: Weekday; label: string; short: string }[] = [
	{ id: 'mon', label: 'Monday', short: 'M' },
	{ id: 'tue', label: 'Tuesday', short: 'T' },
	{ id: 'wed', label: 'Wednesday', short: 'W' },
	{ id: 'thu', label: 'Thursday', short: 'T' },
	{ id: 'fri', label: 'Friday', short: 'F' },
	{ id: 'sat', label: 'Saturday', short: 'S' },
	{ id: 'sun', label: 'Sunday', short: 'S' }
];

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

export function describeSchedule(message: ScheduledMessage): string {
	if (message.kind === 'once') {
		return message.runAt === '' ? 'No date set' : `Once, on ${message.runAt.replace('T', ' at ')}`;
	}
	if (message.days.length === 0) return 'No days picked';
	if (message.days.length === 7) return `Every day at ${message.timeOfDay}`;

	const names = WEEKDAYS.filter((day) => message.days.includes(day.id)).map((day) => day.label);
	return `${names.join(', ')} at ${message.timeOfDay}`;
}

export function nextRuns(message: ScheduledMessage, count = 3): string[] {
	if (message.kind === 'once') {
		return message.runAt === '' ? [] : [message.runAt.replace('T', ' at ')];
	}
	if (message.days.length === 0) return [];

	const ordered = WEEKDAYS.filter((day) => message.days.includes(day.id));
	const runs: string[] = [];
	let week = 0;

	while (runs.length < count) {
		for (const day of ordered) {
			if (runs.length >= count) break;
			const prefix = week === 0 ? 'this' : week === 1 ? 'next' : `in ${String(week)} weeks,`;
			runs.push(`${prefix} ${day.label} at ${message.timeOfDay}`);
		}
		week += 1;
	}

	return runs;
}
