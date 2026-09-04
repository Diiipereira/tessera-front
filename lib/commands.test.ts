import { describe, expect, it } from 'vitest';
import { cooldownLabel } from '@/lib/commands';
describe('cooldownLabel', () => {
	it('says None rather than 0s', () => {
		expect(cooldownLabel(0)).toBe('None');
	});

	it('keeps seconds under a minute', () => {
		expect(cooldownLabel(30)).toBe('30s');
	});

	it('rolls up to minutes and hours', () => {
		expect(cooldownLabel(1800)).toBe('30m');
		expect(cooldownLabel(86400)).toBe('24h');
	});

	it('keeps one decimal rather than lying about a rounded value', () => {
		expect(cooldownLabel(90)).toBe('1.5m');
	});
});
