import { describe, expect, it } from 'vitest';
import {
	DEFAULT_USAGE_WINDOW,
	USAGE_WINDOWS,
	blankCommandFilters,
	byUses,
	failureRate,
	filterCommands,
	isUsageWindow,
	moduleCounts,
	modulesIn,
	totalUses,
	usedCount,
	windowParams,
	type CommandDto,
	type CommandFilters
} from './command-report';

const command = (name: string, patch: Partial<CommandDto> = {}): CommandDto => ({
	name,
	module: 'moderation',
	uses: 0,
	failures: 0,
	lastUsedAt: null,
	subcommands: [],
	...patch
});

const filters = (patch: Partial<CommandFilters> = {}): CommandFilters => ({
	...blankCommandFilters,
	...patch
});

const CATALOG: CommandDto[] = [
	command('warn', { uses: 12 }),
	command('ban', { uses: 3 }),
	command('rank', { module: 'levels', uses: 0 }),
	command('config', { module: null, uses: 5, subcommands: [command('welcome', { uses: 5 })] })
];

describe('filterCommands', () => {
	it('shows everything when nothing was asked for', () => {
		expect(filterCommands(CATALOG, filters())).toHaveLength(4);
	});

	it('finds a command by name', () => {
		expect(filterCommands(CATALOG, filters({ query: 'war' })).map((one) => one.name)).toEqual([
			'warn'
		]);
	});

	it('lets the slash a person types come along', () => {
		expect(filterCommands(CATALOG, filters({ query: '/warn' })).map((one) => one.name)).toEqual([
			'warn'
		]);
	});

	it('finds a command by one of its subcommands', () => {
		expect(filterCommands(CATALOG, filters({ query: 'welcome' })).map((one) => one.name)).toEqual([
			'config'
		]);
	});

	it('narrows to a module', () => {
		expect(filterCommands(CATALOG, filters({ module: 'levels' })).map((one) => one.name)).toEqual([
			'rank'
		]);
	});

	it('hides what nobody ran, when that is what was asked', () => {
		expect(
			filterCommands(CATALOG, filters({ onlyUsed: true })).map((one) => one.name)
		).not.toContain('rank');
	});

	it('reads a search of nothing but spaces as no search at all', () => {
		expect(filterCommands(CATALOG, filters({ query: '   ' }))).toHaveLength(4);
	});

	it('applies the module and the search together, not one or the other', () => {
		expect(filterCommands(CATALOG, filters({ module: 'levels', query: 'warn' }))).toEqual([]);
	});
});

describe('modulesIn', () => {
	it('lists each module once, leaving out the commands that belong to none', () => {
		expect(modulesIn(CATALOG)).toEqual(['moderation', 'levels']);
	});
});

describe('moduleCounts', () => {
	it('counts the commands of each module', () => {
		expect(moduleCounts(CATALOG)).toEqual({ moderation: 2, levels: 1 });
	});
});

describe('totalUses and usedCount', () => {
	it('adds every run in the window', () => {
		expect(totalUses(CATALOG)).toBe(20);
	});

	it('counts how many commands were touched at all', () => {
		expect(usedCount(CATALOG)).toBe(3);
	});
});

describe('failureRate', () => {
	it('reads the share of runs that blew up', () => {
		expect(failureRate({ name: 'warn', uses: 10, failures: 2, lastUsedAt: null })).toBe(20);
	});

	it('says nothing about a command nobody ran, instead of zero per cent', () => {
		expect(failureRate({ name: 'warn', uses: 0, failures: 0, lastUsedAt: null })).toBeNull();
	});
});

describe('byUses', () => {
	it('puts the busiest command first', () => {
		expect([...CATALOG].sort(byUses).map((one) => one.name)[0]).toBe('warn');
	});

	it('breaks a tie by name, so the order never wobbles', () => {
		expect([command('z'), command('a')].sort(byUses).map((one) => one.name)).toEqual(['a', 'z']);
	});
});

describe('the usage window', () => {
	it('opens on a window the API offers', () => {
		expect(isUsageWindow(DEFAULT_USAGE_WINDOW)).toBe(true);
	});

	it('refuses one the API would answer 400 to', () => {
		for (const value of [0, 1, 365]) expect(isUsageWindow(value)).toBe(false);
	});

	it('asks for the window in the shape the route takes', () => {
		for (const window of USAGE_WINDOWS) {
			expect(windowParams(window).get('days')).toBe(String(window));
		}
	});
});
