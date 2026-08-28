import type { AuditEntry, AuditSource } from '@/lib/types/management';

export type DiffKind = 'added' | 'removed' | 'changed';

export type DiffRow = {
	field: string;
	kind: DiffKind;
	before: string | null;
	after: string | null;
};

export const SOURCE_LABELS: Record<AuditSource, string> = {
	web: 'Web',
	slash: 'Slash',
	api: 'API'
};

export type ValueWords = {
	none: string;
	on: string;
	off: string;
	empty: string;
	emptyList: string;
	unreadable: string;
};

export function formatValue(value: unknown, words: ValueWords): string {
	if (value === null || value === undefined) return words.none;
	if (typeof value === 'boolean') return value ? words.on : words.off;
	if (typeof value === 'string') return value === '' ? words.empty : value;
	if (Array.isArray(value)) {
		return value.length === 0
			? words.emptyList
			: value.map((entry) => formatValue(entry, words)).join(', ');
	}
	if (typeof value === 'number') return String(value);
	if (typeof value === 'object') return JSON.stringify(value);
	return words.unreadable;
}

export function fieldLabel(field: string): string {
	const spaced = field
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/[._]/g, ' ')
		.toLowerCase()
		.trim();
	return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function changedFields(entry: AuditEntry): string[] {
	return [...new Set([...Object.keys(entry.before), ...Object.keys(entry.after)])].sort();
}

export function diffEntry(entry: AuditEntry, words: ValueWords): DiffRow[] {
	return changedFields(entry).flatMap<DiffRow>((field) => {
		const had = Object.hasOwn(entry.before, field);
		const has = Object.hasOwn(entry.after, field);
		const before = formatValue(entry.before[field], words);
		const after = formatValue(entry.after[field], words);

		if (had && has) {
			if (before === after) return [];
			return [{ field, kind: 'changed', before, after }];
		}
		if (has) return [{ field, kind: 'added', before: null, after }];
		return [{ field, kind: 'removed', before, after: null }];
	});
}

export type AuditFilters = {
	query: string;
	actor: string;
	module: string;
	source: AuditSource | 'all';
};

export function filterAudit(entries: AuditEntry[], filters: AuditFilters): AuditEntry[] {
	const term = filters.query.trim().toLowerCase();

	return entries.filter((entry) => {
		if (filters.actor !== 'all' && entry.actorName !== filters.actor) return false;
		if (filters.module !== 'all' && entry.module !== filters.module) return false;
		if (filters.source !== 'all' && entry.source !== filters.source) return false;
		if (term === '') return true;
		return (
			entry.action.toLowerCase().includes(term) ||
			entry.actorName.toLowerCase().includes(term) ||
			entry.module.toLowerCase().includes(term) ||
			changedFields(entry).some((field) => fieldLabel(field).toLowerCase().includes(term))
		);
	});
}

export function toCsv(entries: AuditEntry[], words: ValueWords): string {
	const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
	const header = ['at', 'actor', 'action', 'module', 'source', 'changes'];

	const rows = entries.map((entry) =>
		[
			entry.at,
			entry.actorName,
			entry.action,
			entry.module,
			SOURCE_LABELS[entry.source],
			diffEntry(entry, words)
				.map(
					(row) =>
						`${fieldLabel(row.field)}: ${row.before ?? words.none} -> ${row.after ?? words.none}`
				)
				.join('; ')
		]
			.map(escape)
			.join(',')
	);

	return [header.map(escape).join(','), ...rows].join('\n');
}
