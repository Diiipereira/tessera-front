import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { casesUrl, listCases, readCase } from './cases-client';
import type { CasePage } from './types/management';

const GUILD_ID = '931562055025168435';

const page: CasePage = { cases: [], nextCursor: null, viewerRole: 'moderator' };

const json = (status: number, body: unknown): Response =>
	({
		ok: status >= 200 && status < 300,
		status,
		json: () => Promise.resolve(body)
	}) as Response;

describe('casesUrl', () => {
	it('asks for the guild with no query when nothing is filtered', () => {
		expect(casesUrl(GUILD_ID, {})).toMatch(new RegExp(`/guilds/${GUILD_ID}/cases$`));
	});

	it('carries each filter it was given', () => {
		const url = casesUrl(GUILD_ID, {
			type: 'ban',
			status: 'standing',
			targetId: '444444444444444444',
			cursor: '10',
			limit: 25
		});

		expect(url).toContain('type=ban');
		expect(url).toContain('status=standing');
		expect(url).toContain('targetId=444444444444444444');
		expect(url).toContain('cursor=10');
		expect(url).toContain('limit=25');
	});

	it('leaves out a filter that was not set, so the API never sees an empty one', () => {
		const url = casesUrl(GUILD_ID, { type: 'warn' });

		expect(url).not.toContain('status');
		expect(url).not.toContain('cursor');
	});
});

describe('listCases', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('sends the session cookie, or every read is a 401', async () => {
		vi.mocked(fetch).mockResolvedValue(json(200, page));

		await listCases(GUILD_ID, {});

		expect(vi.mocked(fetch).mock.calls[0]?.[1]).toMatchObject({ credentials: 'include' });
	});

	it('hands back the page it read', async () => {
		vi.mocked(fetch).mockResolvedValue(json(200, { cases: [], nextCursor: '10' }));

		expect(await listCases(GUILD_ID, {})).toEqual({
			status: 'ok',
			page: { cases: [], nextCursor: '10' }
		});
	});

	it('reports a refusal instead of pretending there are no cases', async () => {
		vi.mocked(fetch).mockResolvedValue(
			json(403, { error: { code: 'FORBIDDEN', message: 'No dashboard access' } })
		);

		expect((await listCases(GUILD_ID, {})).status).toBe('error');
	});

	it('reports a dead network with the reason', async () => {
		vi.mocked(fetch).mockRejectedValue(new Error('connect ECONNREFUSED'));

		expect(await listCases(GUILD_ID, {})).toEqual({
			status: 'error',
			message: 'connect ECONNREFUSED'
		});
	});
});

describe('readCase', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('asks for the case by its number', async () => {
		vi.mocked(fetch).mockResolvedValue(json(200, { number: 7 }));

		await readCase(GUILD_ID, 7);

		const target = vi.mocked(fetch).mock.calls[0]?.[0];

		expect(typeof target === 'string' ? target : '').toContain(`/guilds/${GUILD_ID}/cases/7`);
	});

	it('reports a case number that does not exist rather than returning an empty one', async () => {
		vi.mocked(fetch).mockResolvedValue(
			json(404, { error: { code: 'NOT_FOUND', message: 'Case #7 does not exist' } })
		);

		expect((await readCase(GUILD_ID, 7)).status).toBe('error');
	});
});
