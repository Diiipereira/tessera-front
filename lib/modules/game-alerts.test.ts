import { describe, expect, it } from 'vitest';
import {
	discordTokens,
	gameAlertVariables,
	isBlankEmbed,
	previewShape,
	toGameAlertsConfig,
	toGameAlertsPatch,
	toPreviewBody,
	toggleStore
} from './game-alerts';
import { emptyEmbedDraft } from './welcome';

const CHANNEL = '901234567890123010';
const ROLE = '345678901234567890';

const words = {
	roleName: (id: string): string | null => (id === ROLE ? 'Gamers' : null),
	unknownRole: 'cargo desconhecido',
	absolute: (): string => '17 de setembro de 2026 12:00',
	relative: (): string => 'em 6 dias'
};

describe('toGameAlertsConfig', () => {
	it('opens a module nobody configured with the defaults the registry declares', () => {
		const config = toGameAlertsConfig({ enabled: false, config: {} }, '#5865f2');

		expect(config).toMatchObject({
			enabled: false,
			channelId: null,
			stores: ['epic'],
			pingRoleIds: [],
			showUpcoming: true
		});
		expect(config.message.mode).toBe('embed');
		expect(config.message.embed.color).toBe('#5865f2');
	});

	it('reads the card off as text mode, and drops a store this build does not know', () => {
		const config = toGameAlertsConfig({
			enabled: true,
			config: { useEmbed: false, stores: ['epic', 'ubisoft'], message: 'Oi {game}' }
		});

		expect(config.message).toMatchObject({ mode: 'text', text: 'Oi {game}' });
		expect(config.stores).toEqual(['epic']);
	});
});

describe('what the screen sends', () => {
	it('sends a blank line as nothing, so the bot falls back to its own', () => {
		const config = toGameAlertsConfig({ enabled: true, config: { channelId: CHANNEL } });

		expect(
			toGameAlertsPatch({ ...config, message: { ...config.message, text: '   ' } })
		).toMatchObject({ channelId: CHANNEL, message: null, useEmbed: true });
	});

	it('gives the preview the same settings, without the channel it does not need', () => {
		const config = toGameAlertsConfig({
			enabled: true,
			config: { channelId: CHANNEL, pingRoleIds: [ROLE] }
		});

		expect(toPreviewBody(config)).not.toHaveProperty('channelId');
		expect(toPreviewBody(config).pingRoleIds).toEqual([ROLE]);
	});
});

describe('isBlankEmbed', () => {
	it('calls a card with only a colour blank, which is when the bot sends its own', () => {
		expect(isBlankEmbed(emptyEmbedDraft('#ff0000'))).toBe(true);
		expect(isBlankEmbed({ ...emptyEmbedDraft(), title: '{game}' })).toBe(false);
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

	it('writes the full date for the end and the relative time for what comes next', () => {
		expect(
			discordTokens('até <t:1789657200:f>, <t:1789657200:R>', words).map((one) => one.sample)
		).toEqual(['17 de setembro de 2026 12:00', 'em 6 dias']);
	});
});

describe('previewShape', () => {
	it('puts the text above the cards and keeps every card', () => {
		const shape = previewShape({
			content: `<@&${ROLE}> A seguir: X`,
			embeds: [{ title: 'A' }, { title: 'B' }]
		});

		expect(shape.message.mode).toBe('embed');
		expect(shape.message.embed.title).toBe('A');
		expect(shape.lead).toBe(`<@&${ROLE}> A seguir: X`);
		expect(shape.more.map((one) => one.title)).toEqual(['B']);
	});

	it('shows plain text when the card is off', () => {
		const shape = previewShape({ content: '**Luftrausers** está grátis', embeds: [] });

		expect(shape.message).toMatchObject({ mode: 'text', text: '**Luftrausers** está grátis' });
		expect(shape.more).toEqual([]);
	});
});

describe('gameAlertVariables', () => {
	const fallback = { game: 'Nome do jogo', until: 'o fim da promoção', url: 'link da loja' };

	it('shows the real game of the week when the store has one', () => {
		const variables = gameAlertVariables(
			{
				title: 'Luftrausers',
				url: 'https://store.epicgames.com/p/luftrausers-51e5e9',
				endsAt: '2026-09-17T15:00:00.000Z'
			},
			fallback,
			() => '17/09'
		);

		expect(variables.map((one) => one.sample)).toEqual([
			'Luftrausers',
			'Epic Games Store',
			'17/09',
			'https://store.epicgames.com/p/luftrausers-51e5e9'
		]);
	});

	it('falls back to words when the store has nothing', () => {
		expect(gameAlertVariables(null, fallback, () => '').map((one) => one.sample)).toEqual([
			'Nome do jogo',
			'Epic Games Store',
			'o fim da promoção',
			'link da loja'
		]);
	});
});

describe('toggleStore', () => {
	it('turns a store on and off, and keeps the order the dashboard lists them in', () => {
		expect(toggleStore([], 'epic', true)).toEqual(['epic']);
		expect(toggleStore(['epic'], 'epic', true)).toEqual(['epic']);
		expect(toggleStore(['epic'], 'epic', false)).toEqual([]);
	});
});
