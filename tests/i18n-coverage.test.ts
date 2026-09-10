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

function sources(dir: string): string[] {
	return readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);

		if (statSync(path).isDirectory()) {
			return SKIP_DIRS.has(name) ? [] : sources(path);
		}

		return name.endsWith('.tsx') && !/\.(test|spec)\.tsx$/.test(name) ? [path] : [];
	});
}

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
	const files = [...sources(join(ROOT, 'app')), ...sources(join(ROOT, 'components'))]
		.map((path) => relative(ROOT, path).split(String.fromCharCode(92)).join('/'))
		.filter((path) => !OUTSIDE_THE_PROVIDER.includes(path));

	it('reads a real number of files, so a broken walk cannot pass as clean', () => {
		expect(files.length).toBeGreaterThan(100);
	});

	it.each(files)('%s has no sentence written straight into the markup', (path) => {
		expect(leaks(join(ROOT, path))).toEqual([]);
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
