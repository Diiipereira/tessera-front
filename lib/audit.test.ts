import { describe, expect, it } from 'vitest';
import {
	colorOf,
	diffKindOf,
	fieldKeyOf,
	fieldLabel,
	formatValue,
	initialsOf,
	toCsv,
	type CsvWords,
	type ValueWords
} from './audit';
import type { AuditEntry } from './types/management';

const words: ValueWords = {
	none: 'none',
	on: 'on',
	off: 'off',
	empty: '(empty)',
	emptyList: '(empty list)',
	unreadable: 'unreadable'
};

const entry = (over: Partial<AuditEntry> = {}): AuditEntry => ({
	id: '1',
	moduleKey: 'welcome',
	path: 'welcome.channelId',
	before: null,
	after: '111111111111111111',
	actor: { id: '222222222222222222', name: 'Lia', avatarHash: null },
	source: 'web',
	at: '2026-08-29T10:04:00.000Z',
	...over
});

describe('formatValue', () => {
	it('names an absent value instead of printing null', () => {
		expect(formatValue(null, words)).toBe('none');
		expect(formatValue(undefined, words)).toBe('none');
	});

	it('says on and off rather than true and false', () => {
		expect(formatValue(true, words)).toBe('on');
		expect(formatValue(false, words)).toBe('off');
	});

	it('separates an empty string from an absent one', () => {
		expect(formatValue('', words)).toBe('(empty)');
		expect(formatValue(null, words)).toBe('none');
	});

	it('reads a list, and says when it is empty', () => {
		expect(formatValue(['a', 'b'], words)).toBe('a, b');
		expect(formatValue([], words)).toBe('(empty list)');
	});

	it('keeps a snowflake as text, never as a rounded number', () => {
		expect(formatValue('111111111111111111', words)).toBe('111111111111111111');
	});

	it('falls back to JSON for an object rather than printing [object Object]', () => {
		expect(formatValue({ title: 'Hi' }, words)).toBe('{"title":"Hi"}');
	});
});

describe('diffKindOf', () => {
	it('calls it added when there was nothing before', () => {
		expect(diffKindOf(entry({ before: null, after: 'x' }))).toBe('added');
	});

	it('calls it removed when there is nothing after', () => {
		expect(diffKindOf(entry({ before: 'x', after: null }))).toBe('removed');
	});

	it('calls it changed when both sides have a value', () => {
		expect(diffKindOf(entry({ before: 'x', after: 'y' }))).toBe('changed');
	});

	it('treats false as a value, not as an absence', () => {
		expect(diffKindOf(entry({ before: false, after: true }))).toBe('changed');
	});
});

describe('fieldKeyOf', () => {
	it('drops the module prefix the path carries', () => {
		expect(fieldKeyOf(entry({ path: 'welcome.channelId' }))).toBe('channelId');
	});

	it('keeps a nested field whole', () => {
		expect(fieldKeyOf(entry({ path: 'welcome.embed.title' }))).toBe('embed.title');
	});

	it('survives a path with no prefix at all', () => {
		expect(fieldKeyOf(entry({ path: 'enabled' }))).toBe('enabled');
	});

	it('survives an entry with no path', () => {
		expect(fieldKeyOf(entry({ path: null }))).toBe('');
	});
});

describe('fieldLabel', () => {
	it('spaces out a camel case key as a last resort', () => {
		expect(fieldLabel('channelId')).toBe('Channel id');
		expect(fieldLabel('logChannelId')).toBe('Log channel id');
	});
});

describe('initialsOf', () => {
	it('takes the first letter, uppercased', () => {
		expect(initialsOf('lia', '?')).toBe('L');
	});

	it('falls back when the actor has no name left', () => {
		expect(initialsOf(null, '?')).toBe('?');
		expect(initialsOf('   ', '?')).toBe('?');
	});
});

describe('colorOf', () => {
	it('gives the same actor the same colour every render', () => {
		expect(colorOf('222222222222222222')).toBe(colorOf('222222222222222222'));
	});

	it('always answers with a colour, even with nothing to hash', () => {
		expect(colorOf(null)).toMatch(/^#[0-9a-f]{6}$/);
	});
});

describe('toCsv', () => {
	const csvWords: CsvWords = {
		...words,
		at: 'When',
		actor: 'Who',
		module: 'Module',
		field: 'Field',
		source: 'Source',
		before: 'Before',
		after: 'After',
		unknownActor: 'Removed account'
	};

	const labels = (): { module: string; field: string; source: string } => ({
		module: 'Welcome',
		field: 'Welcome channel',
		source: 'Dashboard'
	});

	it('writes a header and one row per entry', () => {
		const csv = toCsv([entry(), entry({ id: '2' })], csvWords, labels);

		expect(csv.split('\n')).toHaveLength(3);
	});

	it('writes the translated labels, not the raw keys', () => {
		const csv = toCsv([entry()], csvWords, labels);

		expect(csv).toContain('"Welcome channel"');
		expect(csv).not.toContain('channelId');
	});

	it('names the actor when the account is gone', () => {
		const csv = toCsv(
			[entry({ actor: { id: null, name: null, avatarHash: null } })],
			csvWords,
			labels
		);

		expect(csv).toContain('"Removed account"');
	});

	it('doubles a quote instead of breaking the row', () => {
		const csv = toCsv([entry({ after: 'say "hi"' })], csvWords, labels);

		expect(csv).toContain('"say ""hi"""');
	});

	it('writes an empty log as just the header', () => {
		expect(toCsv([], csvWords, labels).split('\n')).toHaveLength(1);
	});
});
