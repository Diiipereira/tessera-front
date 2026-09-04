import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadRules, saveRules, testMessage } from './automod-client';
import type { AutomodRulePayload } from '@/lib/modules/automod';

const GUILD_ID = '931562055025168435';

const json = (status: number, body: unknown): Response =>
	({
		ok: status >= 200 && status < 300,
		status,
		json: () => Promise.resolve(body)
	}) as Response;

const rule: AutomodRulePayload = {
	name: 'No links',
	trigger: 'links',
	threshold: 1,
	windowSeconds: 10,
	actions: ['delete'],
	exemptRoleIds: [],
	exemptChannelIds: [],
	words: [],
	enabled: true
};

const saved = { ...rule, id: 'rule-1' };

const callOf = (call: number): [string, RequestInit] =>
	vi.mocked(fetch).mock.calls[call] as unknown as [string, RequestInit];

const bodyOf = (call: number): unknown => {
	const { body } = callOf(call)[1];

	return typeof body === 'string' ? JSON.parse(body) : null;
};

describe('the automod client', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	describe('loadRules', () => {
		it('sends the session cookie, since that is where the session lives', async () => {
			vi.mocked(fetch).mockResolvedValue(json(200, { rules: [saved] }));

			await loadRules(GUILD_ID);

			const [url, init] = callOf(0);

			expect(url).toContain(`/guilds/${GUILD_ID}/automod`);
			expect(init.credentials).toBe('include');
		});

		it('hands back the rules the API answered with', async () => {
			vi.mocked(fetch).mockResolvedValue(json(200, { rules: [saved] }));

			await expect(loadRules(GUILD_ID)).resolves.toEqual({ status: 'ok', rules: [saved] });
		});

		it('explains a refusal instead of pretending the guild has no rules', async () => {
			vi.mocked(fetch).mockResolvedValue(
				json(403, { error: { code: 'FORBIDDEN', message: 'You cannot read this' } })
			);

			await expect(loadRules(GUILD_ID)).resolves.toEqual({
				status: 'error',
				message: 'You cannot read this'
			});
		});

		it('says the API could not be reached rather than throwing at the screen', async () => {
			vi.mocked(fetch).mockRejectedValue(new Error('fetch failed'));

			await expect(loadRules(GUILD_ID)).resolves.toEqual({
				status: 'error',
				message: 'fetch failed'
			});
		});
	});

	describe('saveRules', () => {
		it('replaces the whole list in one PUT', async () => {
			vi.mocked(fetch).mockResolvedValue(json(200, { rules: [saved] }));

			await saveRules(GUILD_ID, [rule]);

			const [, init] = callOf(0);

			expect(init.method).toBe('PUT');
			expect(bodyOf(0)).toEqual({ rules: [rule] });
		});

		it('hands back what the API stored, not what was sent', async () => {
			vi.mocked(fetch).mockResolvedValue(json(200, { rules: [{ ...saved, name: 'Renamed' }] }));

			const result = await saveRules(GUILD_ID, [rule]);

			expect(result).toEqual({ status: 'ok', rules: [{ ...saved, name: 'Renamed' }] });
		});

		it('reads the validation issues the API listed', async () => {
			vi.mocked(fetch).mockResolvedValue(
				json(400, {
					error: {
						code: 'VALIDATION_FAILED',
						details: { issues: [{ path: 'rules.0.name', message: 'is required' }] }
					}
				})
			);

			await expect(saveRules(GUILD_ID, [rule])).resolves.toEqual({
				status: 'error',
				message: 'rules.0.name: is required'
			});
		});
	});

	describe('testMessage', () => {
		it('sends the message and the rules on screen, not the saved ones', async () => {
			vi.mocked(fetch).mockResolvedValue(json(201, { fired: [], untestable: [] }));

			await testMessage(GUILD_ID, 'hello there', [rule]);

			const [url, init] = callOf(0);

			expect(url).toContain(`/guilds/${GUILD_ID}/automod/test`);
			expect(init.method).toBe('POST');
			expect(bodyOf(0)).toEqual({ content: 'hello there', rules: [rule] });
		});

		it('hands back the reading, with the reason each rule fired for', async () => {
			const reading = {
				fired: [{ name: 'No links', reason: { kind: 'links', count: 2 } }],
				untestable: ['Flood']
			};

			vi.mocked(fetch).mockResolvedValue(json(201, reading));

			await expect(testMessage(GUILD_ID, 'x', [rule])).resolves.toEqual({
				status: 'ok',
				reading
			});
		});

		it('carries the abort signal, so a stale answer never lands', async () => {
			vi.mocked(fetch).mockResolvedValue(json(201, { fired: [], untestable: [] }));

			const controller = new AbortController();

			await testMessage(GUILD_ID, 'x', [rule], controller.signal);

			const [, init] = callOf(0);

			expect(init.signal).toBe(controller.signal);
		});

		it('reports a refusal rather than leaving the last reading on screen', async () => {
			vi.mocked(fetch).mockResolvedValue(
				json(400, { error: { message: 'That rule has no name' } })
			);

			await expect(testMessage(GUILD_ID, 'x', [rule])).resolves.toEqual({
				status: 'error',
				message: 'That rule has no name'
			});
		});
	});
});
