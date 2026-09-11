import { describe, expect, it } from 'vitest';
import {
	discordTokens,
	previewShape,
	previewTextOf,
	toGameAlertsConfig,
	toGameAlertsPatch,
	toPreviewBody,
	toggleStore
} from './game-alerts';

const CHANNEL = '901234567890123010';
const ROLE = '345678901234567890';
const STORE_URL = 'https://store.epicgames.com/p/astral-ascent';

const words = {
	roleName: (id: string): string | null => (id === ROLE ? 'Gamers' : null),
	unknownRole: 'cargo desconhecido',
	absolute: (): string => '17 de setembro de 2026 12:00'
};

const claim = {
	type: 1,
	components: [{ type: 2, style: 5, label: 'Resgatar na Epic Games Store', url: STORE_URL }]
};

describe('toGameAlertsConfig', () => {
	it('opens a module nobody configured with the defaults the registry declares', () => {
		expect(toGameAlertsConfig({ enabled: false, config: {} })).toEqual({
			enabled: false,
			channelId: null,
			stores: ['epic'],
			pingRoleIds: [],
			pingEveryone: false,
			showUpcoming: true
		});
	});

	it('drops a store this build does not know, and the card an older version saved', () => {
		const config = toGameAlertsConfig({
			enabled: true,
			config: { stores: ['epic', 'ubisoft'], useEmbed: false, message: 'Oi' }
		});

		expect(config.stores).toEqual(['epic']);
		expect(config).not.toHaveProperty('message');
	});

	it('mentions everyone only when the saved value says so exactly', () => {
		expect(toGameAlertsConfig({ enabled: true, config: { pingEveryone: true } }).pingEveryone).toBe(
			true
		);
		expect(
			toGameAlertsConfig({ enabled: true, config: { pingEveryone: 'yes' } }).pingEveryone
		).toBe(false);
	});
});

describe('what the screen sends', () => {
	it('saves the channel and every setting the preview draws with', () => {
		const config = toGameAlertsConfig({
			enabled: true,
			config: { channelId: CHANNEL, pingRoleIds: [ROLE], pingEveryone: true }
		});

		expect(toGameAlertsPatch(config)).toEqual({
			channelId: CHANNEL,
			stores: ['epic'],
			pingRoleIds: [ROLE],
			pingEveryone: true,
			showUpcoming: true
		});
	});

	it('gives the preview the same settings, without the channel it does not need', () => {
		const config = toGameAlertsConfig({ enabled: true, config: { channelId: CHANNEL } });

		expect(toPreviewBody(config)).not.toHaveProperty('channelId');
	});
});

describe('discordTokens', () => {
	it('names a mentioned role, so the preview shows @Gamers and not a number', () => {
		expect(discordTokens(`<@&${ROLE}> olha`, words)).toEqual([
			{ token: `<@&${ROLE}>`, key: `role.${ROLE}`, sample: '@Gamers' }
		]);
	});

	it('says a role is unknown instead of showing its id', () => {
		expect(discordTokens('<@&111111111111111111>', words)[0]?.sample).toBe('@cargo desconhecido');
	});

	it('keeps @everyone a mention, the way Discord paints it', () => {
		expect(discordTokens(`@everyone <@&${ROLE}>`, words).map((one) => one.sample)).toEqual([
			'@everyone',
			'@Gamers'
		]);
	});

	it('writes the end of the offer as a full date in the reader language', () => {
		expect(discordTokens('até <t:1789657200:f>', words).map((one) => one.sample)).toEqual([
			'17 de setembro de 2026 12:00'
		]);
	});
});

describe('previewTextOf', () => {
	it('reads the whole card, the footer included', () => {
		const text = previewTextOf({
			content: '@everyone',
			embeds: [
				{
					title: 'Astral Ascent',
					description: 'Grátis até <t:1:f>.',
					footer: { text: 'A seguir: Mindcop' }
				}
			]
		});

		expect(text).toContain('<t:1:f>');
		expect(text).toContain('A seguir: Mindcop');
		expect(text).toContain('@everyone');
	});
});

describe('previewShape', () => {
	it('puts the mentions above the one card, and the claim link under it', () => {
		const shape = previewShape({
			content: `<@&${ROLE}>`,
			embeds: [{ title: 'Astral Ascent' }],
			components: [claim]
		});

		expect(shape?.message.mode).toBe('embed');
		expect(shape?.message.embed.title).toBe('Astral Ascent');
		expect(shape?.lead).toBe(`<@&${ROLE}>`);
		expect(shape?.links).toEqual([{ label: 'Resgatar na Epic Games Store', url: STORE_URL }]);
	});

	it('dates what comes next from the timestamp of the card', () => {
		const shape = previewShape({
			content: '',
			embeds: [
				{
					title: 'Astral Ascent',
					footer: { text: 'A seguir: Mindcop' },
					timestamp: '2026-09-17T15:00:00.000Z'
				}
			],
			components: []
		});

		expect(shape?.nextUpAt?.toISOString()).toBe('2026-09-17T15:00:00.000Z');
		expect(shape?.message.embed.timestamp).toBe(true);
	});

	it('has no date to show when nothing comes next', () => {
		expect(
			previewShape({ content: '', embeds: [{ title: 'Astral Ascent' }], components: [] })?.nextUpAt
		).toBeNull();
	});

	it('has nothing to draw when the API sent no card', () => {
		expect(previewShape({ content: '', embeds: [], components: [] })).toBeNull();
	});
});

describe('toggleStore', () => {
	it('turns a store on and off, and keeps the order the dashboard lists them in', () => {
		expect(toggleStore([], 'epic', true)).toEqual(['epic']);
		expect(toggleStore(['epic'], 'epic', true)).toEqual(['epic']);
		expect(toggleStore(['epic'], 'epic', false)).toEqual([]);
	});
});
