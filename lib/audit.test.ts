import { describe, expect, it } from 'vitest';
import { diffEntry, fieldLabel, filterAudit, formatValue, toCsv } from '@/lib/audit';
import type { AuditEntry } from '@/lib/types/management';

function entry(partial: Partial<AuditEntry>): AuditEntry {
	return {
		id: 'a',
		actorName: 'lia',
		actorInitials: 'L',
		actorColor: '#fff',
		action: 'Changed something',
		module: 'AutoMod',
		source: 'web',
		at: '2026-08-25T12:00:00.000Z',
		before: {},
		after: {},
		...partial
	};
}

describe('formatValue', () => {
	it('reads booleans as on and off, not true and false', () => {
		expect(formatValue(true)).toBe('on');
		expect(formatValue(false)).toBe('off');
	});

	it('marks an empty string apart from a missing one', () => {
		expect(formatValue('')).toBe('(empty)');
		expect(formatValue(null)).toBe('none');
	});

	it('joins a list and names the empty case', () => {
		expect(formatValue(['Staff', 'Admin'])).toBe('Staff, Admin');
		expect(formatValue([])).toBe('(empty list)');
	});
});

describe('fieldLabel', () => {
	it('splits camelCase into words', () => {
		expect(fieldLabel('exemptRoleIds')).toBe('Exempt role ids');
	});

	it('flattens a dotted path', () => {
		expect(fieldLabel('message.embed.title')).toBe('Message embed title');
	});
});

describe('diffEntry', () => {
	it('drops fields whose value did not move', () => {
		const rows = diffEntry(entry({ before: { threshold: 1 }, after: { threshold: 1 } }));
		expect(rows).toEqual([]);
	});

	it('marks a field only in `after` as added', () => {
		const rows = diffEntry(entry({ before: {}, after: { winners: 2 } }));
		expect(rows).toEqual([{ field: 'winners', kind: 'added', before: null, after: '2' }]);
	});

	it('marks a field only in `before` as removed', () => {
		const rows = diffEntry(entry({ before: { name: 'coinflip' }, after: {} }));
		expect(rows).toEqual([{ field: 'name', kind: 'removed', before: 'coinflip', after: null }]);
	});

	it('keeps a field explicitly set to null as a change, not a removal', () => {
		const rows = diffEntry(entry({ before: { channel: 'general' }, after: { channel: null } }));
		expect(rows[0]?.kind).toBe('changed');
		expect(rows[0]?.after).toBe('none');
	});

	it('sorts rows by field name so the diff does not jump around', () => {
		const rows = diffEntry(entry({ before: { zeta: 1, alpha: 1 }, after: { zeta: 2, alpha: 2 } }));
		expect(rows.map((row) => row.field)).toEqual(['alpha', 'zeta']);
	});
});

describe('filterAudit', () => {
	const entries = [
		entry({ id: '1', actorName: 'lia', module: 'AutoMod', source: 'web' }),
		entry({ id: '2', actorName: 'okra', module: 'Levels', source: 'slash' }),
		entry({ id: '3', actorName: 'lia', module: 'Levels', source: 'api' })
	];

	const base = { query: '', actor: 'all', module: 'all', source: 'all' } as const;

	it('returns everything with no filters', () => {
		expect(filterAudit(entries, base)).toHaveLength(3);
	});

	it('narrows by actor and module together', () => {
		const found = filterAudit(entries, { ...base, actor: 'lia', module: 'Levels' });
		expect(found.map((found) => found.id)).toEqual(['3']);
	});

	it('narrows by source', () => {
		expect(filterAudit(entries, { ...base, source: 'slash' })).toHaveLength(1);
	});

	it('searches the changed field names, not only the action sentence', () => {
		const withField = entry({ id: '4', before: {}, after: { cooldownSeconds: 60 } });
		const found = filterAudit([...entries, withField], { ...base, query: 'cooldown' });
		expect(found.map((found) => found.id)).toEqual(['4']);
	});
});

describe('toCsv', () => {
	it('writes a header and one row per entry', () => {
		const csv = toCsv([entry({ before: { a: 1 }, after: { a: 2 } })]);
		const lines = csv.split('\n');
		expect(lines).toHaveLength(2);
		expect(lines[0]).toContain('"actor"');
		expect(lines[1]).toContain('A: 1 -> 2');
	});

	it('escapes a quote inside a reason rather than breaking the row', () => {
		const csv = toCsv([entry({ action: 'Said "hello"' })]);
		expect(csv).toContain('"Said ""hello"""');
		expect(csv.split('\n')).toHaveLength(2);
	});
});
