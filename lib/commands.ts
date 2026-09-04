import type { CommandCategory } from '@/lib/types/management';

export const COMMAND_CATEGORIES: CommandCategory[] = [
	'Moderation',
	'Levels',
	'Economy',
	'Tickets',
	'Community',
	'Utility'
];

export function cooldownLabel(seconds: number): string {
	if (seconds <= 0) return 'None';
	if (seconds < 60) return `${String(seconds)}s`;
	if (seconds < 3600) {
		const minutes = seconds / 60;
		return Number.isInteger(minutes) ? `${String(minutes)}m` : `${minutes.toFixed(1)}m`;
	}
	const hours = seconds / 3600;
	return Number.isInteger(hours) ? `${String(hours)}h` : `${hours.toFixed(1)}h`;
}

const NAME_PATTERN = /^[a-z0-9_-]{1,32}$/;

export type CommandNameIssue = 'empty' | 'shape' | 'taken';

export function commandNameIssue(name: string, taken: string[]): CommandNameIssue | undefined {
	if (name === '') return 'empty';
	if (!NAME_PATTERN.test(name)) return 'shape';
	if (taken.includes(name)) return 'taken';
	return undefined;
}
