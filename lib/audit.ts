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

export function formatValue(value: unknown): string {
	if (value === null || value === undefined) return 'none';
	if (typeof value === 'boolean') return value ? 'on' : 'off';
	if (typeof value === 'string') return value === '' ? '(empty)' : value;
	if (Array.isArray(value)) {
		return value.length === 0
			? '(empty list)'
			: value.map((entry) => formatValue(entry)).join(', ');
	}
	if (typeof value === 'number') return String(value);
	if (typeof value === 'object') return JSON.stringify(value);
	return 'unreadable';
}

export function fieldLabel(field: string): string {
	const spaced = field
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/[._]/g, ' ')
		.toLowerCase()
		.trim();
	return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function diffEntry(entry: AuditEntry): DiffRow[] {
	const fields = [...new Set([...Object.keys(entry.before), ...Object.keys(entry.after)])].sort();

	return fields.flatMap<DiffRow>((field) => {
		const had = Object.hasOwn(entry.before, field);
		const has = Object.hasOwn(entry.after, field);
		const before = formatValue(entry.before[field]);
		const after = formatValue(entry.after[field]);

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
			diffEntry(entry).some((row) => fieldLabel(row.field).toLowerCase().includes(term))
		);
	});
}

export function toCsv(entries: AuditEntry[]): string {
	const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
	const header = ['at', 'actor', 'action', 'module', 'source', 'changes'];

	const rows = entries.map((entry) =>
		[
			entry.at,
			entry.actorName,
			entry.action,
			entry.module,
			SOURCE_LABELS[entry.source],
			diffEntry(entry)
				.map((row) => `${fieldLabel(row.field)}: ${row.before ?? 'none'} -> ${row.after ?? 'none'}`)
				.join('; ')
		]
			.map(escape)
			.join(',')
	);

	return [header.map(escape).join(','), ...rows].join('\n');
}
