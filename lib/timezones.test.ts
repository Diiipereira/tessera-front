import { describe, expect, it } from 'vitest';
import { timezoneOptions, zoneLabel } from './timezones';

const AUGUST = new Date('2026-08-27T12:00:00.000Z');

describe('zoneLabel', () => {
	it('carries the offset, so two cities on the same hour are still distinguishable', () => {
		expect(zoneLabel('America/Sao_Paulo', AUGUST)).toBe('America/Sao Paulo (GMT-3)');
	});

	it('reads underscores as the spaces they stand for', () => {
		expect(zoneLabel('America/New_York', AUGUST)).toContain('America/New York');
	});

	it('falls back to the raw zone instead of throwing on one the runtime lacks', () => {
		expect(zoneLabel('Mars/Olympus_Mons', AUGUST)).toBe('Mars/Olympus_Mons');
	});
});

describe('timezoneOptions', () => {
	const options = timezoneOptions(AUGUST);

	it('offers the whole IANA list, not a handful somebody picked', () => {
		expect(options.length).toBeGreaterThan(100);
	});

	it('keeps the IANA id as the value, since that is what the API stores', () => {
		const found = options.find((option) => option.value === 'America/Sao_Paulo');

		expect(found?.label).toBe('America/Sao Paulo (GMT-3)');
	});

	it('includes UTC', () => {
		expect(options.some((option) => option.value === 'UTC')).toBe(true);
	});

	it('searches on the raw id too, so the underscore spelling still finds it', () => {
		const found = options.find((option) => option.value === 'America/Sao_Paulo');

		expect(found?.search).toContain('america/sao_paulo');
	});

	it('lowercases the search text once, rather than at every keystroke', () => {
		expect(options.every((option) => option.search === option.search.toLowerCase())).toBe(true);
	});
});
