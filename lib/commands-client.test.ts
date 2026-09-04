import { afterEach, describe, expect, it, vi } from 'vitest';
import { commandsUrl, loadCommands } from './commands-client';

const GUILD_ID = '842315097461823104';

const report = {
	since: '2026-08-29T00:00:00.000Z',
	until: '2026-09-05T00:00:00.000Z',
	commands: []
};

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('commandsUrl', () => {
	it('asks for the window the screen is showing', () => {
		expect(commandsUrl(GUILD_ID, 30)).toContain('days=30');
	});

	it('asks the guild route, not a global one', () => {
		expect(commandsUrl(GUILD_ID, 7)).toContain(`/guilds/${GUILD_ID}/commands`);
	});
});

describe('loadCommands', () => {
	it('hands back what the API answered', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(() => Promise.resolve(new Response(JSON.stringify(report), { status: 200 })))
		);

		await expect(loadCommands(GUILD_ID, 7)).resolves.toEqual({ status: 'loaded', report });
	});

	it('carries the session cookie, or the API would answer 401', async () => {
		const fetched = vi.fn(() =>
			Promise.resolve(new Response(JSON.stringify(report), { status: 200 }))
		);

		vi.stubGlobal('fetch', fetched);
		await loadCommands(GUILD_ID, 7);

		expect(fetched).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({ credentials: 'include' })
		);
	});

	it('reads the refusal the API sent instead of a bare status', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(() =>
				Promise.resolve(
					new Response(
						JSON.stringify({
							error: { code: 'VALIDATION_ERROR', message: 'The window has to be 7, 30 or 90 days' }
						}),
						{
							status: 400
						}
					)
				)
			)
		);

		const result = await loadCommands(GUILD_ID, 7);

		expect(result).toMatchObject({ status: 'error' });
		expect(result.status === 'error' && result.message).toBe(
			'The window has to be 7, 30 or 90 days'
		);
	});

	it('says the API could not be reached instead of throwing at the screen', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(() => Promise.reject(new Error('offline')))
		);

		await expect(loadCommands(GUILD_ID, 7)).resolves.toEqual({
			status: 'error',
			message: 'offline'
		});
	});
});
