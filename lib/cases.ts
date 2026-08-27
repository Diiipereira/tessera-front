import { hasPassed, MOCK_NOW } from '@/lib/time';
import type { CaseStatus, ModerationCase } from '@/lib/types/management';
import type { ModerationAction } from '@/lib/types/modules';

export const ACTION_LABELS: Record<ModerationAction, string> = {
	warn: 'Warn',
	timeout: 'Timeout',
	mute: 'Mute',
	kick: 'Kick',
	ban: 'Ban'
};

export function caseStatus(entry: ModerationCase, now: Date = MOCK_NOW): CaseStatus {
	if (entry.revoked) return 'revoked';
	if (entry.expiresAt === null) return 'active';
	return hasPassed(entry.expiresAt, now) ? 'expired' : 'active';
}

export type CaseFilters = {
	query: string;
	action: ModerationAction | 'all';
	status: CaseStatus | 'all';
	moderator: string;
};

export function filterCases(
	cases: ModerationCase[],
	filters: CaseFilters,
	now: Date = MOCK_NOW
): ModerationCase[] {
	const term = filters.query.trim().toLowerCase();

	return cases.filter((entry) => {
		if (filters.action !== 'all' && entry.action !== filters.action) return false;
		if (filters.status !== 'all' && caseStatus(entry, now) !== filters.status) return false;
		if (filters.moderator !== 'all' && entry.moderatorName !== filters.moderator) return false;
		if (term === '') return true;
		return (
			entry.targetName.toLowerCase().includes(term) ||
			entry.reason.toLowerCase().includes(term) ||
			`#${String(entry.number)}`.includes(term)
		);
	});
}

export function relatedCases(cases: ModerationCase[], entry: ModerationCase): ModerationCase[] {
	return cases.filter((other) => other.targetId === entry.targetId && other.id !== entry.id);
}
