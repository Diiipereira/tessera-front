import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('components/layout/AppShell.tsx', 'utf8');

const mainClasses = /<main className="([^"]*)"/.exec(source)?.[1] ?? '';

describe('the scrolling area of the dashboard', () => {
	it('is the one place the page scrolls', () => {
		expect(mainClasses).toContain('overflow-y-auto');
	});

	it('holds the scrollbar space open, so a save bar appearing does not shove the page sideways', () => {
		expect(mainClasses).toContain('scrollbar-gutter-stable');
	});
});
