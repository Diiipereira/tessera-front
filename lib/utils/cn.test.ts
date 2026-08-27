import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
	it('keeps a type token and a colour token together', () => {
		const out = cn('text-overline', 'text-on-dark');

		expect(out).toContain('text-overline');
		expect(out).toContain('text-on-dark');
	});

	it('keeps every type step alive next to a colour', () => {
		const steps = [
			'text-display',
			'text-display-sm',
			'text-h1',
			'text-h2',
			'text-h3',
			'text-h4',
			'text-body-lg',
			'text-body',
			'text-body-sm',
			'text-caption',
			'text-overline'
		];

		for (const step of steps) {
			expect(cn(step, 'text-text-muted').split(' ')).toContain(step);
		}
	});

	it('still lets one type step replace another', () => {
		expect(cn('text-body', 'text-h1')).toBe('text-h1');
	});

	it('still lets one colour replace another', () => {
		expect(cn('text-text-muted', 'text-danger')).toBe('text-danger');
	});

	it('treats a breakpoint variant as its own slot', () => {
		const out = cn('text-display-sm lg:text-display', 'text-text');

		expect(out).toContain('text-display-sm');
		expect(out).toContain('lg:text-display');
		expect(out).toContain('text-text');
	});

	it('keeps merging everything else as before', () => {
		expect(cn('px-2', 'px-4')).toBe('px-4');
		expect(cn('bg-surface', 'bg-surface-sunken')).toBe('bg-surface-sunken');
	});
});
