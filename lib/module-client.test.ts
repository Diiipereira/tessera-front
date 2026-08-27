import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { describeFailure, patchModule } from './module-client';

const GUILD_ID = '931562055025168435';

const json = (status: number, body: unknown): Response =>
	({
		ok: status >= 200 && status < 300,
		status,
		json: () => Promise.resolve(body)
	}) as Response;

describe('describeFailure', () => {
	it('spells out every validation issue the registry raised', () => {
		expect(
			describeFailure(
				{
					error: {
						code: 'CONFIG_INVALID',
						message: 'invalid',
						details: {
							issues: [
								{ path: 'message', message: 'Too big' },
								{ path: 'autoRoles', message: 'Too many' }
							]
						}
					}
				},
				400
			)
		).toBe('message: Too big; autoRoles: Too many');
	});

	it('falls back to the message when there are no issues', () => {
		expect(describeFailure({ error: { message: 'Nope' } }, 403)).toBe('Nope');
	});

	it('never leaves the caller without something to show', () => {
		expect(describeFailure({}, 500)).toBe('The API answered 500');
	});
});

describe('patchModule', () => {
	const fetchMock = vi.fn();

	beforeEach(() => {
		vi.stubGlobal('fetch', fetchMock);
		fetchMock.mockReset();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('returns the saved state on success', async () => {
		const state = { key: 'welcome', enabled: true, config: {}, version: 5 };
		fetchMock.mockResolvedValue(json(200, state));

		await expect(patchModule(GUILD_ID, 'welcome', { version: 4 })).resolves.toEqual({
			status: 'saved',
			state
		});
	});

	it('re-reads the module on a conflict, so the form can show what is really stored', async () => {
		const theirs = { key: 'welcome', enabled: true, config: { message: 'Theirs' }, version: 9 };
		fetchMock
			.mockResolvedValueOnce(json(409, { error: { code: 'CONFIG_CONFLICT' } }))
			.mockResolvedValueOnce(json(200, theirs));

		await expect(patchModule(GUILD_ID, 'welcome', { version: 4 })).resolves.toEqual({
			status: 'conflict',
			state: theirs
		});
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it('reports a validation refusal as an error the member can read', async () => {
		fetchMock.mockResolvedValue(
			json(400, {
				error: { details: { issues: [{ path: 'message', message: 'Too big' }] } }
			})
		);

		await expect(patchModule(GUILD_ID, 'welcome', { version: 4 })).resolves.toEqual({
			status: 'error',
			message: 'message: Too big'
		});
	});

	it('does not pretend a dead API is a conflict', async () => {
		fetchMock.mockRejectedValue(new Error('Failed to fetch'));

		await expect(patchModule(GUILD_ID, 'welcome', { version: 4 })).resolves.toEqual({
			status: 'error',
			message: 'Failed to fetch'
		});
	});

	it('sends the session cookie, or the API would answer 401', async () => {
		fetchMock.mockResolvedValue(
			json(200, { key: 'welcome', enabled: true, config: {}, version: 5 })
		);

		await patchModule(GUILD_ID, 'welcome', { version: 4 });

		const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];

		expect(init.credentials).toBe('include');
		expect(init.method).toBe('PATCH');
	});
});
