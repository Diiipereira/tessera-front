import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { auditUrl, readAudit } from './audit-client';
import type { AuditPage } from './types/management';

const GUILD_ID = '931562055025168435';

const page: AuditPage = { entries: [], nextCursor: null };

const json = (status: number, body: unknown): Response =>
	({
		ok: status >= 200 && status < 300,
		status,
		json: () => Promise.resolve(body)
	}) as Response;

describe('auditUrl', () => {
	it('asks for the guild with no query when nothing is filtered', () => {
		expect(auditUrl(GUILD_ID, {})).toMatch(new RegExp(`/guilds/${GUILD_ID}/audit$`));
	});

	it('carries each filter it was given', () => {
		const url = auditUrl(GUILD_ID, { moduleKey: 'welcome', source: 'slash', limit: 25 });

		expect(url).toContain('moduleKey=welcome');
		expect(url).toContain('source=slash');
		expect(url).toContain('limit=25');
	});

	it('escapes the cursor rather than pasting it raw', () => {
		expect(auditUrl(GUILD_ID, { cursor: '1787997840000.42' })).toContain('cursor=1787997840000.42');
	});

	it('leaves out a filter that was not set, so the API does not see an empty one', () => {
		const url = auditUrl(GUILD_ID, { source: 'web' });

		expect(url).not.toContain('moduleKey');
		expect(url).not.toContain('cursor');
	});
});

describe('readAudit', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('sends the session cookie, or every read is a 401', async () => {
		vi.mocked(fetch).mockResolvedValue(json(200, page));

		await readAudit(GUILD_ID, {});

		expect(vi.mocked(fetch).mock.calls[0]?.[1]).toMatchObject({ credentials: 'include' });
	});

	it('hands back the page it read', async () => {
		vi.mocked(fetch).mockResolvedValue(json(200, { entries: [], nextCursor: '1787997840000.42' }));

		const result = await readAudit(GUILD_ID, {});

		expect(result).toEqual({
			status: 'ok',
			page: { entries: [], nextCursor: '1787997840000.42' }
		});
	});

	it('reports a refusal instead of pretending the log is empty', async () => {
		vi.mocked(fetch).mockResolvedValue(
			json(403, { error: { code: 'FORBIDDEN', message: 'No dashboard access' } })
		);

		const result = await readAudit(GUILD_ID, {});

		expect(result.status).toBe('error');
	});

	it('reports a dead network the same way, with the reason', async () => {
		vi.mocked(fetch).mockRejectedValue(new Error('connect ECONNREFUSED'));

		const result = await readAudit(GUILD_ID, {});

		expect(result).toEqual({ status: 'error', message: 'connect ECONNREFUSED' });
	});
});
