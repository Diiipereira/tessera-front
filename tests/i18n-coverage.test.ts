import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import enUS from '@/messages/en-US.json';
import ptBR from '@/messages/pt-BR.json';

const ROOT = resolve(import.meta.dirname, '..');

const SKIP_DIRS = new Set(['node_modules', '.next', '.git', 'coverage', 'tests']);

const OUTSIDE_THE_PROVIDER = ['app/global-error.tsx'];

const JSX_TEXT = /^[A-Za-z][A-Za-z0-9 ,.!?'’&/+-]{2,}$/;

const PROSE_TEMPLATE = /`[^`$]*[A-Za-z]{3,}[^`$]* [A-Za-z]{2,}[^`]*`/;

const KEYWORDS = new Set(['return', 'export', 'default', 'from', 'true', 'false', 'type']);

function sources(dir: string, wanted: (name: string) => boolean): string[] {
	return readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);

		if (statSync(path).isDirectory()) {
			return SKIP_DIRS.has(name) ? [] : sources(path, wanted);
		}

		return wanted(name) && !/\.(test|spec)\.tsx?$/.test(name) ? [path] : [];
	});
}

const MARKUP = (name: string): boolean => name.endsWith('.tsx');

const CODE = (name: string): boolean => name.endsWith('.ts') || name.endsWith('.tsx');

function inJsx(lines: string[], index: number): boolean {
	const before = [...lines.slice(0, index)].reverse().find((line) => line.trim() !== '') ?? '';
	const after = lines.slice(index + 1).find((line) => line.trim() !== '') ?? '';

	return before.trim().endsWith('>') && after.trim().startsWith('<');
}

function leaks(path: string): string[] {
	const lines = readFileSync(path, 'utf8').split('\n');
	const found: string[] = [];

	lines.forEach((raw, index) => {
		const line = raw.trim();

		if (line.startsWith('//') || line.startsWith('*') || line.startsWith('/*')) return;

		if (JSX_TEXT.test(line) && !KEYWORDS.has(line.split(' ')[0] ?? '') && inJsx(lines, index)) {
			found.push(`${String(index + 1)}: ${line}`);
		}

		if (
			PROSE_TEMPLATE.test(raw) &&
			!/className|cn\(|style|href|url|https?:|aria-|data-|\/api\//i.test(raw)
		) {
			found.push(`${String(index + 1)}: ${line}`);
		}
	});

	return found;
}

type Tree = { [key: string]: string | Tree };

function flatten(node: Tree, prefix = ''): string[] {
	return Object.entries(node).flatMap(([key, value]) => {
		const path = prefix === '' ? key : `${prefix}.${key}`;

		return typeof value === 'string' ? [path] : flatten(value, path);
	});
}

describe('every screen speaks the language of whoever is looking', () => {
	const files = [
		...sources(join(ROOT, 'app'), MARKUP),
		...sources(join(ROOT, 'components'), MARKUP)
	]
		.map((path) => relative(ROOT, path).split(String.fromCharCode(92)).join('/'))
		.filter((path) => !OUTSIDE_THE_PROVIDER.includes(path));

	it('reads a real number of files, so a broken walk cannot pass as clean', () => {
		expect(files.length).toBeGreaterThan(100);
	});

	it.each(files)('%s has no sentence written straight into the markup', (path) => {
		expect(leaks(join(ROOT, path))).toEqual([]);
	});
});

const RAW_RUNTIME_TEXT = /\.message\b|\.fallback\b|instanceof Error/;

const INTERPOLATION = /\$\{[^}]*\}/g;

const TWO_WORDS = /[A-Za-z]{2,}[^\n]*\s[^\n]*[A-Za-z]{2,}/;

function literalsIn(text: string): string[] {
	const found: string[] = [];
	let cursor = 0;

	while (cursor < text.length) {
		const quote = text[cursor];

		if (quote !== "'" && quote !== '"' && quote !== '`') {
			cursor += 1;
			continue;
		}

		let end = cursor + 1;

		while (end < text.length && text[end] !== quote) {
			end += text[end] === String.fromCharCode(92) ? 2 : 1;
		}

		found.push(text.slice(cursor + 1, end));
		cursor = end + 1;
	}

	return found;
}

const isProse = (literal: string): boolean => TWO_WORDS.test(literal.replace(INTERPOLATION, ''));

type ToastCall = { line: number; text: string };

function toastCalls(source: string): ToastCall[] {
	const calls: ToastCall[] = [];
	const opener = /\btoast\.[a-z]+\(/g;
	let found = opener.exec(source);

	while (found !== null) {
		let depth = 1;
		let cursor = found.index + found[0].length;

		while (cursor < source.length && depth > 0) {
			if (source[cursor] === '(') depth += 1;
			if (source[cursor] === ')') depth -= 1;
			cursor += 1;
		}

		calls.push({
			line: source.slice(0, found.index).split('\n').length,
			text: source.slice(found.index, cursor)
		});

		found = opener.exec(source);
	}

	return calls;
}

function shouts(path: string): string[] {
	const source = readFileSync(path, 'utf8');

	return toastCalls(source)
		.filter(({ text }) => RAW_RUNTIME_TEXT.test(text) || literalsIn(text).some(isProse))
		.map(({ line, text }) => `${String(line)}: ${text.split('\n')[0] ?? ''}`);
}

describe('a toast never shows text the reader did not ask for in their language', () => {
	const toasting = [
		...sources(join(ROOT, 'app'), CODE),
		...sources(join(ROOT, 'components'), CODE),
		...sources(join(ROOT, 'lib'), CODE)
	]
		.map((path) => relative(ROOT, path).split(String.fromCharCode(92)).join('/'))
		.filter((path) => readFileSync(join(ROOT, path), 'utf8').includes('toast.'));

	it('finds the screens that raise toasts, so an empty sweep cannot pass as clean', () => {
		expect(toasting.length).toBeGreaterThan(20);
	});

	it.each(toasting)('%s hands every toast a translated sentence', (path) => {
		expect(shouts(join(ROOT, path))).toEqual([]);
	});
});

describe('the two dictionaries', () => {
	const en = flatten(enUS);
	const pt = flatten(ptBR);

	it('carry exactly the same keys, or a screen falls back to the key itself', () => {
		expect(en.filter((key) => !pt.includes(key))).toEqual([]);
		expect(pt.filter((key) => !en.includes(key))).toEqual([]);
	});
});
