import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { TeamSeatDto } from '@/lib/api-url';
import { deleteSeat, putSeat } from './team-client';

const GUILD_ID = '931562055025168435';
const USER_ID = '304918273645102938';

const json = (status: number, body: unknown): Response =>
	({
		ok: status >= 200 && status < 300,
		status,
		json: () => Promise.resolve(body)
	}) as Response;

const seat: TeamSeatDto = {
	userId: USER_ID,
	username: 'lia.exe',
	globalName: 'lia',
	avatarHash: null,
	role: 'moderator',
	source: 'guild-staff',
	grantedBy: 'okra',
	grantedAt: '2026-08-28T10:00:00.000Z',
	lastSeenAt: null
};

const urlOf = (index = 0): string => {
	const target = vi.mocked(fetch).mock.calls[index]?.[0];

	return typeof target === 'string' ? target : '';
};

describe('putSeat', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('addresses the seat route the API actually serves', async () => {
		vi.mocked(fetch).mockResolvedValue(json(200, seat));

		await putSeat(GUILD_ID, USER_ID, 'moderator');

		expect(urlOf()).toBe(`http://localhost:3001/guilds/${GUILD_ID}/team/${USER_ID}`);
	});

	it('sends the cookie and the role, since the session lives in one', async () => {
		vi.mocked(fetch).mockResolvedValue(json(200, seat));

		await putSeat(GUILD_ID, USER_ID, 'moderator');

		const [, init] = vi.mocked(fetch).mock.calls[0] ?? [];

		expect(init?.method).toBe('PUT');
		expect(init?.credentials).toBe('include');
		expect(init?.body).toBe(JSON.stringify({ role: 'moderator' }));
	});

	it('hands back the seat the API stored, not the one that was asked for', async () => {
		vi.mocked(fetch).mockResolvedValue(json(200, { ...seat, role: 'viewer' }));

		await expect(putSeat(GUILD_ID, USER_ID, 'moderator')).resolves.toEqual({
			status: 'saved',
			seat: { ...seat, role: 'viewer' }
		});
	});

	it('explains a refusal instead of swallowing it', async () => {
		vi.mocked(fetch).mockResolvedValue(
			json(400, {
				error: { code: 'SEAT_NOT_ASSIGNABLE', message: 'You cannot change your own seat' }
			})
		);

		await expect(putSeat(GUILD_ID, USER_ID, 'viewer')).resolves.toEqual({
			status: 'error',
			message: 'You cannot change your own seat'
		});
	});

	it('says the API could not be reached rather than throwing at the screen', async () => {
		vi.mocked(fetch).mockRejectedValue(new Error('fetch failed'));

		await expect(putSeat(GUILD_ID, USER_ID, 'viewer')).resolves.toEqual({
			status: 'error',
			message: 'fetch failed'
		});
	});
});

describe('deleteSeat', () => {
	beforeEach(() => {
		vi.stubGlobal('fetch', vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('addresses the seat route with DELETE', async () => {
		vi.mocked(fetch).mockResolvedValue({ ok: true, status: 204 } as Response);

		await deleteSeat(GUILD_ID, USER_ID);

		const [, init] = vi.mocked(fetch).mock.calls[0] ?? [];

		expect(urlOf()).toBe(`http://localhost:3001/guilds/${GUILD_ID}/team/${USER_ID}`);
		expect(init?.method).toBe('DELETE');
	});

	it('does not read a body from the 204, which has none', async () => {
		const parse = vi.fn();

		vi.mocked(fetch).mockResolvedValue({
			ok: true,
			status: 204,
			json: parse
		} as unknown as Response);

		await expect(deleteSeat(GUILD_ID, USER_ID)).resolves.toEqual({ status: 'removed' });
		expect(parse).not.toHaveBeenCalled();
	});

	it('reports a seat that was already gone', async () => {
		vi.mocked(fetch).mockResolvedValue(
			json(404, { error: { code: 'NOT_FOUND', message: 'User holds no seat in guild' } })
		);

		await expect(deleteSeat(GUILD_ID, USER_ID)).resolves.toEqual({
			status: 'error',
			message: 'User holds no seat in guild'
		});
	});
});
