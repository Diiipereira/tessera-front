import { describe, expect, it } from 'vitest';
import { emptyEmbedDraft, toWelcomeConfig, toWelcomePatch, welcomeVariables } from './welcome';
import type { WelcomeConfig } from '@/lib/types/modules';

const CHANNEL_ID = '901234567890123001';

describe('toWelcomeConfig', () => {
	it('reads the registry trio back into one composer draft', () => {
		const config = toWelcomeConfig({
			enabled: true,
			config: {
				channelId: CHANNEL_ID,
				message: 'Bem-vindo {user}!',
				useEmbed: true,
				embed: { title: 'Hi' }
			}
		});

		expect(config.message.mode).toBe('embed');
		expect(config.message.text).toBe('Bem-vindo {user}!');
		expect(config.message.embed.title).toBe('Hi');
	});

	it('survives a row written before a field existed', () => {
		const config = toWelcomeConfig({ enabled: false, config: {} });

		expect(config).toEqual({
			enabled: false,
			channelId: null,
			message: { mode: 'text', text: '', embed: emptyEmbedDraft() },
			autoRoleIds: [],
			pingMode: 'none',
			deleteAfter: null
		});
	});

	it('refuses a ping mode the registry never declared', () => {
		expect(toWelcomeConfig({ enabled: true, config: { pingMode: 'shout' } }).pingMode).toBe('none');
	});

	it('drops anything in the role list that is not an id', () => {
		const config = toWelcomeConfig({
			enabled: true,
			config: { autoRoles: ['801234567890123001', 42, null] }
		});

		expect(config.autoRoleIds).toEqual(['801234567890123001']);
	});

	it('treats a zero or negative delete after as no deletion at all', () => {
		expect(toWelcomeConfig({ enabled: true, config: { deleteAfter: 0 } }).deleteAfter).toBeNull();
		expect(toWelcomeConfig({ enabled: true, config: { deleteAfter: -5 } }).deleteAfter).toBeNull();
		expect(toWelcomeConfig({ enabled: true, config: { deleteAfter: 60 } }).deleteAfter).toBe(60);
	});
});

describe('toWelcomePatch', () => {
	const base: WelcomeConfig = {
		enabled: true,
		channelId: CHANNEL_ID,
		message: { mode: 'text', text: 'Hello {user}', embed: emptyEmbedDraft() },
		autoRoleIds: ['801234567890123001'],
		pingMode: 'inline',
		deleteAfter: 60
	};

	it('splits the composer draft back into the three fields the registry declares', () => {
		expect(toWelcomePatch(base)).toEqual({
			channelId: CHANNEL_ID,
			message: 'Hello {user}',
			useEmbed: false,
			embed: emptyEmbedDraft(),
			autoRoles: ['801234567890123001'],
			pingMode: 'inline',
			deleteAfter: 60
		});
	});

	it('never sends the enabled flag inside config, since it is not a field', () => {
		expect(Object.keys(toWelcomePatch(base))).not.toContain('enabled');
	});

	it('round-trips without losing anything the form can express', () => {
		const back = toWelcomeConfig({ enabled: true, config: toWelcomePatch(base) });

		expect(back).toEqual(base);
	});
});

describe('welcomeVariables', () => {
	it('offers only what the greeting actually substitutes', () => {
		expect(welcomeVariables('Tessera Dev').map((entry) => entry.token)).toEqual([
			'{user}',
			'{server}'
		]);
	});

	it('shows the real server name as the sample', () => {
		expect(welcomeVariables('Tessera Dev')[1]?.sample).toBe('Tessera Dev');
	});
});
