import { describe, expect, it } from 'vitest';
import { shortcutLabel } from '@/lib/hooks/useShortcut';

describe('shortcutLabel', () => {
	it('uses the command glyph on Apple hardware', () => {
		expect(shortcutLabel('K', true)).toBe('⌘K');
	});

	it('spells out Ctrl everywhere else, with a space so it reads as two keys', () => {
		expect(shortcutLabel('K', false)).toBe('Ctrl K');
	});

	it('carries whichever key it is given', () => {
		expect(shortcutLabel('S', false)).toBe('Ctrl S');
		expect(shortcutLabel('S', true)).toBe('⌘S');
	});
});
