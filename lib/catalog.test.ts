import { describe, expect, it } from 'vitest';
import { describeCommand, nameModule } from './catalog';

const registry = (known: Record<string, string>) =>
	Object.assign((key: string) => known[key] ?? '', {
		has: (key: string) => key in known
	});

describe('describeCommand', () => {
	it('reads the description the dictionary carries', () => {
		const known = registry({ 'commands.ping.description': 'Check that the bot is up' });

		expect(describeCommand(known, 'ping')).toBe('Check that the bot is up');
	});

	it('keeps the page up when the bot publishes a command the docs have no words for', () => {
		expect(describeCommand(registry({}), 'ping')).toBe('—');
	});

	it('still lists the command, because the bot really does publish it', () => {
		expect(describeCommand(registry({}), 'ping')).not.toBe('');
	});
});

describe('nameModule', () => {
	it('names the module the way the dictionary does', () => {
		const known = registry({ 'modules.levels.label': 'Níveis' });

		expect(nameModule(known, 'levels')).toBe('Níveis');
	});

	it('falls back to the key rather than taking the page down with it', () => {
		expect(nameModule(registry({}), 'levels')).toBe('levels');
	});
});
