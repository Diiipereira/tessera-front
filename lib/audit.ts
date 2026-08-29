import type { AuditEntry } from '@/lib/types/management';

export type DiffKind = 'added' | 'removed' | 'changed';

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

const isAbsent = (value: unknown): boolean => value === null || value === undefined;

export function diffKindOf(entry: AuditEntry): DiffKind {
	if (isAbsent(entry.before)) return 'added';
	if (isAbsent(entry.after)) return 'removed';
	return 'changed';
}

export function fieldKeyOf(entry: AuditEntry): string {
	if (entry.path === null) return '';

	const [, ...rest] = entry.path.split('.');

	return rest.length === 0 ? entry.path : rest.join('.');
}

export function fieldLabel(field: string): string {
	const spaced = field
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.replace(/[._]/g, ' ')
		.toLowerCase()
		.trim();

	return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function initialsOf(name: string | null, fallback: string): string {
	const trimmed = (name ?? '').trim();

	return trimmed === '' ? fallback : (trimmed[0] ?? fallback).toUpperCase();
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

export function colorOf(seed: string | null): string {
	const text = seed ?? '';
	let total = 0;

	for (let index = 0; index < text.length; index += 1) {
		total = (total + text.charCodeAt(index)) % AVATAR_COLORS.length;
	}

	return AVATAR_COLORS[total] ?? '#6366f1';
}

export type CsvWords = ValueWords & {
	at: string;
	actor: string;
	module: string;
	field: string;
	source: string;
	before: string;
	after: string;
	unknownActor: string;
};

export function toCsv(
	entries: readonly AuditEntry[],
	words: CsvWords,
	labelOf: (entry: AuditEntry) => { module: string; field: string; source: string }
): string {
	const escape = (value: string): string => `"${value.replace(/"/g, '""')}"`;
	const header = [
		words.at,
		words.actor,
		words.module,
		words.field,
		words.source,
		words.before,
		words.after
	];

	const rows = entries.map((entry) => {
		const labels = labelOf(entry);

		return [
			entry.at,
			entry.actor.name ?? words.unknownActor,
			labels.module,
			labels.field,
			labels.source,
			formatValue(entry.before, words),
			formatValue(entry.after, words)
		]
			.map(escape)
			.join(',');
	});

	return [header.map(escape).join(','), ...rows].join('\n');
}
