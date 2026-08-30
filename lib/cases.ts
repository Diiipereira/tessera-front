import type {
	CaseParticipant,
	CaseStatus,
	InfractionType,
	ModerationCase
} from '@/lib/types/management';

export function caseStatus(entry: ModerationCase, now: Date): CaseStatus {
	if (entry.revokedAt !== null) return 'revoked';
	if (!entry.active) return 'done';
	if (entry.expiresAt === null) return 'standing';

	return new Date(entry.expiresAt).getTime() <= now.getTime() ? 'expired' : 'standing';
}

export function displayName(participant: CaseParticipant): string {
	return participant.name ?? participant.handle ?? participant.id;
}

export function initialsOf(participant: CaseParticipant): string {
	const name = participant.name ?? participant.handle;
	const first = (name ?? '').trim()[0];

	return first === undefined ? '?' : first.toUpperCase();
}

const AVATAR_COLORS = [
	'#f97316',
	'#fbbf24',
	'#22c55e',
	'#06b6d4',
	'#6366f1',
	'#8b5cf6',
	'#ec4899',
	'#ef4444'
];

export function colorOf(participant: CaseParticipant): string {
	let total = 0;

	for (let index = 0; index < participant.id.length; index += 1) {
		total = (total + participant.id.charCodeAt(index)) % AVATAR_COLORS.length;
	}

	return AVATAR_COLORS[total] ?? '#6366f1';
}

const SECONDS_PER = { day: 86400, hour: 3600, minute: 60 } as const;

export type DurationParts = { unit: 'day' | 'hour' | 'minute' | 'second'; count: number };

export function durationParts(seconds: number): DurationParts {
	if (seconds % SECONDS_PER.day === 0) {
		return { unit: 'day', count: seconds / SECONDS_PER.day };
	}
	if (seconds % SECONDS_PER.hour === 0) {
		return { unit: 'hour', count: seconds / SECONDS_PER.hour };
	}
	if (seconds % SECONDS_PER.minute === 0) {
		return { unit: 'minute', count: seconds / SECONDS_PER.minute };
	}

	return { unit: 'second', count: seconds };
}

export const WRITE_CASES = 'cases.write';

export type UndoKind = 'withdraw' | 'unban' | 'unsilence';

const UNDO_KINDS: Partial<Record<InfractionType, UndoKind>> = {
	note: 'withdraw',
	warn: 'withdraw',
	kick: 'withdraw',
	softban: 'withdraw',
	ban: 'unban',
	mute: 'unsilence',
	timeout: 'unsilence'
};

const deadlinePassed = (entry: ModerationCase, now: Date): boolean =>
	entry.expiresAt !== null && new Date(entry.expiresAt).getTime() <= now.getTime();

export function undoKind(entry: ModerationCase, now: Date): UndoKind | null {
	if (entry.revokedAt !== null) return null;

	const kind = UNDO_KINDS[entry.type] ?? null;

	if (kind === null) return null;

	return entry.type === 'timeout' && deadlinePassed(entry, now) ? 'withdraw' : kind;
}

export function touchesDiscord(kind: UndoKind): boolean {
	return kind !== 'withdraw';
}

export const MAX_REVOKE_REASON = 512;
