import { describe, expect, it } from 'vitest';
import { hasSignedInHint } from './session-hint';

describe('hasSignedInHint', () => {
	it('finds the hint on its own', () => {
		expect(hasSignedInHint('tessera-signed-in=1')).toBe(true);
	});

	it('finds the hint among other cookies', () => {
		expect(hasSignedInHint('theme=dark; tessera-signed-in=1; other=x')).toBe(true);
	});

	it('is false on an empty cookie jar, which is every anonymous visitor', () => {
		expect(hasSignedInHint('')).toBe(false);
	});

	it('is false when the hint was cleared to an empty value', () => {
		expect(hasSignedInHint('tessera-signed-in=')).toBe(false);
	});

	it('does not match a cookie that merely starts with the same name', () => {
		expect(hasSignedInHint('tessera-signed-in-elsewhere=1')).toBe(false);
	});

	it('does not match the value appearing inside another cookie', () => {
		expect(hasSignedInHint('note=tessera-signed-in=1')).toBe(false);
	});
});
