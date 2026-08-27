import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { patchSettings } from './settings-client';

const GUILD_ID = '931562055025168435';

const json = (status: number, body: unknown): Response =>
	({
		ok: status >= 200 && status < 300,
		status,
		json: () => Promise.resolve(body)
	}) as Response;

const saved = {
	locale: 'pt-BR',
	timezone: 'America/Sao_Paulo',
	embedColor: '#5865f2',
	botNickname: ''
};

describe('patchSettings', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('sends the cookie, since the session lives in one', async () => {
		vi.mocked(fetch).mockResolvedValue(json(200, saved));

		await patchSettings(GUILD_ID, { locale: 'pt-BR' });

		const [, init] = vi.mocked(fetch).mock.calls[0] ?? [];

		expect(init?.credentials).toBe('include');
		expect(init?.method).toBe('PATCH');
	});

	it('hands back what the API saved, not what was sent', async () => {
		vi.mocked(fetch).mockResolvedValue(json(200, { ...saved, locale: 'en-US' }));

		const result = await patchSettings(GUILD_ID, { locale: 'en-US' });

		expect(result).toEqual({ status: 'saved', settings: { ...saved, locale: 'en-US' } });
	});

	it('explains a refusal instead of swallowing it', async () => {
		vi.mocked(fetch).mockResolvedValue(
			json(400, { error: { code: 'SETTINGS_INVALID', message: '"es-ES" is not a locale' } })
		);

		await expect(patchSettings(GUILD_ID, { locale: 'es-ES' })).resolves.toEqual({
			status: 'error',
			message: '"es-ES" is not a locale'
		});
	});

	it('says the API could not be reached rather than throwing at the screen', async () => {
		vi.mocked(fetch).mockRejectedValue(new Error('fetch failed'));

		await expect(patchSettings(GUILD_ID, { locale: 'en-US' })).resolves.toEqual({
			status: 'error',
			message: 'fetch failed'
		});
	});

	it('still says something when the API answers with no body', async () => {
		vi.mocked(fetch).mockResolvedValue({
			ok: false,
			status: 500,
			json: () => Promise.reject(new Error('no body'))
		} as Response);

		const result = await patchSettings(GUILD_ID, { locale: 'en-US' });

		expect(result).toEqual({ status: 'error', message: 'The API answered 500' });
	});
});
