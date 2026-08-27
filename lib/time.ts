import { formatDistanceStrict } from 'date-fns';

export const MOCK_NOW = new Date('2026-08-25T18:30:00.000Z');

const ABSOLUTE = new Intl.DateTimeFormat('en-GB', {
	day: '2-digit',
	month: 'short',
	year: 'numeric',
	hour: '2-digit',
	minute: '2-digit',
	timeZone: 'UTC'
});

const DATE_ONLY = new Intl.DateTimeFormat('en-GB', {
	day: '2-digit',
	month: 'short',
	year: 'numeric',
	timeZone: 'UTC'
});

export function relativeTime(iso: string, now: Date = MOCK_NOW): string {
	const at = new Date(iso);
	if (Number.isNaN(at.getTime())) return 'unknown';
	if (Math.abs(now.getTime() - at.getTime()) < 45_000) return 'just now';
	return formatDistanceStrict(at, now, { addSuffix: true });
}

export function absoluteTime(iso: string): string {
	const at = new Date(iso);
	if (Number.isNaN(at.getTime())) return 'unknown';
	return ABSOLUTE.format(at);
}

export function dateOnly(iso: string): string {
	const at = new Date(iso);
	if (Number.isNaN(at.getTime())) return 'unknown';
	return DATE_ONLY.format(at);
}

export function remaining(iso: string | null, now: Date = MOCK_NOW): string | null {
	if (iso === null) return null;
	const at = new Date(iso);
	if (Number.isNaN(at.getTime())) return null;
	if (at.getTime() <= now.getTime()) return null;
	return formatDistanceStrict(at, now);
}

export function hasPassed(iso: string | null, now: Date = MOCK_NOW): boolean {
	if (iso === null) return false;
	const at = new Date(iso);
	if (Number.isNaN(at.getTime())) return false;
	return at.getTime() <= now.getTime();
}

export function formatCountdown(seconds: number): string {
	if (seconds <= 0) return 'ended';
	const days = Math.floor(seconds / 86400);
	const hours = Math.floor((seconds % 86400) / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);

	if (days > 0) return `${String(days)}d ${String(hours)}h`;
	if (hours > 0) return `${String(hours)}h ${String(minutes)}m`;
	return `${String(minutes)}m`;
}
