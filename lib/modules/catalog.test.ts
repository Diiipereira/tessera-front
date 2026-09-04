import { describe, expect, it } from 'vitest';
import type { GuildModuleStateDto } from '@/lib/api-url';
import {
	hasScreen,
	isCategory,
	statusOf,
	toModuleSummaries,
	type ModuleCatalogDto
} from './catalog';

const entry = (key: string, category: string) => ({
	key,
	category,
	i18nLabel: `modules.${key}.label`,
	i18nDescription: `modules.${key}.description`,
	fields: []
});

const state = (key: string, patch: Partial<GuildModuleStateDto> = {}): GuildModuleStateDto => ({
	key,
	enabled: false,
	configured: true,
	config: {},
	version: 1,
	...patch
});

const catalog: ModuleCatalogDto = {
	modules: [entry('welcome', 'engagement'), entry('tickets', 'community')]
};

describe('statusOf', () => {
	it('calls a module that is on active', () => {
		expect(statusOf(state('welcome', { enabled: true }))).toBe('active');
	});

	it('calls a module that is off but complete off', () => {
		expect(statusOf(state('welcome'))).toBe('off');
	});

	it('calls a module still short of a required field needs-setup', () => {
		expect(statusOf(state('welcome', { configured: false }))).toBe('needs-setup');
	});
});

describe('toModuleSummaries', () => {
	it('takes the category from the catalog and the state from the guild', () => {
		const summaries = toModuleSummaries(catalog, [
			state('welcome', { enabled: true, version: 4 }),
			state('tickets')
		]);

		expect(summaries).toEqual([
			{ id: 'welcome', category: 'engagement', status: 'active', version: 4 },
			{ id: 'tickets', category: 'community', status: 'off', version: 1 }
		]);
	});

	it('keeps the order the catalog declared, not the order the states arrived in', () => {
		const summaries = toModuleSummaries(catalog, [state('tickets'), state('welcome')]);

		expect(summaries.map((entry) => entry.id)).toEqual(['welcome', 'tickets']);
	});

	it('skips a module this dashboard has no screen for', () => {
		const withGhost: ModuleCatalogDto = {
			modules: [...catalog.modules, entry('ghost', 'utility')]
		};

		const summaries = toModuleSummaries(withGhost, [
			state('welcome'),
			state('tickets'),
			state('ghost')
		]);

		expect(summaries.map((entry) => entry.id)).toEqual(['welcome', 'tickets']);
	});

	it('skips a module the guild has no state for', () => {
		expect(toModuleSummaries(catalog, [state('welcome')]).map((entry) => entry.id)).toEqual([
			'welcome'
		]);
	});

	it('skips a module filed under a category this screen cannot show', () => {
		const odd: ModuleCatalogDto = { modules: [entry('welcome', 'billing')] };

		expect(toModuleSummaries(odd, [state('welcome')])).toEqual([]);
	});
});

describe('what this dashboard can render', () => {
	it('knows the modules it has a screen for', () => {
		expect(hasScreen('welcome')).toBe(true);
		expect(hasScreen('ghost')).toBe(false);
	});

	it('knows the categories it has a filter for', () => {
		expect(isCategory('community')).toBe(true);
		expect(isCategory('Community')).toBe(false);
	});
});
