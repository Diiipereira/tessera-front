import { describe, expect, it } from 'vitest';
import {
	insertAtCursor,
	looksLikeMention,
	renderVariables,
	toSegments,
	unknownVariables,
	usedVariables
} from './message-variables';
import type { MessageVariable } from './types/modules';

const variables: MessageVariable[] = [
	{ token: '{user}', key: 'user', sample: 'novato' },
	{ token: '{user.mention}', key: 'userMention', sample: '@novato' },
	{ token: '{server}', key: 'server', sample: 'Pixel Foundry' },
	{ token: '{memberCount}', key: 'memberCount', sample: '12,432' }
];

describe('renderVariables', () => {
	it('substitutes every occurrence, not only the first', () => {
		expect(renderVariables('{user} and {user} again', variables)).toBe('novato and novato again');
	});

	it('does not let {user} eat the start of {user.mention}', () => {
		expect(renderVariables('Hi {user.mention}, welcome', variables)).toBe('Hi @novato, welcome');
	});

	it('handles several different variables in one string', () => {
		expect(renderVariables('{user} joined {server} — now {memberCount}', variables)).toBe(
			'novato joined Pixel Foundry — now 12,432'
		);
	});

	it('leaves text without variables untouched', () => {
		expect(renderVariables('plain text', variables)).toBe('plain text');
	});

	it('leaves an unknown token alone instead of blanking it', () => {
		expect(renderVariables('Hi {nickname}', variables)).toBe('Hi {nickname}');
	});
});

describe('usedVariables', () => {
	it('reports only the variables actually present', () => {
		const used = usedVariables('{user} in {server}', variables);
		expect(used.map((variable) => variable.token)).toEqual(['{user}', '{server}']);
	});

	it('returns nothing for plain text', () => {
		expect(usedVariables('nothing here', variables)).toEqual([]);
	});
});

describe('unknownVariables', () => {
	it('flags tokens that will not resolve', () => {
		expect(unknownVariables('Hi {nickname} and {user}', variables)).toEqual(['{nickname}']);
	});

	it('reports each unknown token once', () => {
		expect(unknownVariables('{a} {a} {a}', variables)).toEqual(['{a}']);
	});

	it('ignores real braces that are not variable-shaped', () => {
		expect(unknownVariables('a { b } c {1} d', variables)).toEqual([]);
	});
});

describe('insertAtCursor', () => {
	it('inserts at the caret and reports where the caret lands', () => {
		const result = insertAtCursor('Hello world', '{user}', 5, 5);
		expect(result.text).toBe('Hello {user} world');
		expect(result.cursor).toBe(12);
	});

	it('replaces the selected range', () => {
		const result = insertAtCursor('Hello world', '{user}', 6, 11);
		expect(result.text).toBe('Hello {user}');
	});

	it('does not add a leading space at the very start', () => {
		const result = insertAtCursor('', '{user}', 0, 0);
		expect(result.text).toBe('{user}');
		expect(result.cursor).toBe(6);
	});

	it('does not double the space when one is already there', () => {
		const result = insertAtCursor('Hello ', '{user}', 6, 6);
		expect(result.text).toBe('Hello {user}');
	});
});

describe('toSegments', () => {
	it('marks which piece came from a variable, so the preview can show it', () => {
		expect(toSegments('oi {user}, bem-vindo', variables)).toEqual([
			{ text: 'oi ', variable: null },
			{ text: 'novato', variable: variables[0] },
			{ text: ', bem-vindo', variable: null }
		]);
	});

	it('keeps the longer token whole, so {user} never eats {user.mention}', () => {
		const segments = toSegments('{user.mention} falou com {user}', variables);

		expect(segments.map((segment) => segment.text)).toEqual(['@novato', ' falou com ', 'novato']);
	});

	it('marks every occurrence, not only the first', () => {
		const segments = toSegments('{user} e {user}', variables);

		expect(segments.filter((segment) => segment.variable !== null)).toHaveLength(2);
	});

	it('leaves a text with no variable in one piece', () => {
		expect(toSegments('nada aqui', variables)).toEqual([{ text: 'nada aqui', variable: null }]);
	});

	it('gives back nothing for an empty text, instead of an empty piece', () => {
		expect(toSegments('', variables)).toEqual([]);
	});

	it('leaves an unknown token alone, because nothing will replace it', () => {
		expect(toSegments('{nope}', variables)).toEqual([{ text: '{nope}', variable: null }]);
	});
});

describe('looksLikeMention', () => {
	it('reads a sample that Discord would render as a chip', () => {
		expect(looksLikeMention('@novato')).toBe(true);
		expect(looksLikeMention('#welcome')).toBe(true);
		expect(looksLikeMention('novato')).toBe(false);
		expect(looksLikeMention('12,432')).toBe(false);
	});
});
