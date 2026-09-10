import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const HARDCODED = /export const metadata\s*=\s*\{[^}]*title:\s*['"`]/;

function pages(dir: string): string[] {
	return readdirSync(dir).flatMap((entry) => {
		const path = join(dir, entry);

		if (statSync(path).isDirectory()) return pages(path);

		return entry === 'page.tsx' || entry === 'layout.tsx' ? [path] : [];
	});
}

describe('the browser tab', () => {
	it('never spells a title out in one language', () => {
		const guilty = pages('app').filter((path) => HARDCODED.test(readFileSync(path, 'utf8')));

		expect(guilty).toEqual([]);
	});
});
