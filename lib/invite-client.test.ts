import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { InviteDto } from '@/lib/api-url';
import { acceptInvite, mintInvite, revokeInvite } from './invite-client';

const GUILD_ID = '931562055025168435';
const INVITE_ID = 'b7c1a2d3-0000-4000-8000-000000000001';
const TOKEN = 'a-very-long-opaque-token';

const json = (status: number, body: unknown): Response =>
	({
		ok: status >= 200 && status < 300,
		status,
		json: () => Promise.resolve(body)
	}) as Response;

const invite: InviteDto = {
	id: INVITE_ID,
	url: `http://localhost:3000/invite/${TOKEN}`,
	role: 'moderator',
	createdBy: 'lia',
	createdAt: '2026-08-28T09:00:00.000Z',
	expiresAt: '2026-09-04T09:00:00.000Z'
};

const urlOf = (index = 0): string => {
	const target = vi.mocked(fetch).mock.calls[index]?.[0];

	return typeof target === 'string' ? target : '';
};

beforeEach(() => {
	vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('mintInvite', () => {
	it('addresses the invites route the API actually serves', async () => {
		vi.mocked(fetch).mockResolvedValue(json(201, invite));

		await mintInvite(GUILD_ID, 'moderator');

		expect(urlOf()).toBe(`http://localhost:3001/guilds/${GUILD_ID}/invites`);
	});

	it('sends the cookie and the seat the link will grant', async () => {
		vi.mocked(fetch).mockResolvedValue(json(201, invite));

		await mintInvite(GUILD_ID, 'moderator');

		const [, init] = vi.mocked(fetch).mock.calls[0] ?? [];

		expect(init?.method).toBe('POST');
		expect(init?.credentials).toBe('include');
		expect(init?.body).toBe(JSON.stringify({ role: 'moderator' }));
	});

	it('hands back the link the API minted', async () => {
		vi.mocked(fetch).mockResolvedValue(json(201, invite));

		await expect(mintInvite(GUILD_ID, 'moderator')).resolves.toEqual({
			status: 'minted',
			invite
		});
	});

	it('explains a refusal instead of swallowing it', async () => {
		vi.mocked(fetch).mockResolvedValue(
			json(404, { error: { code: 'NOT_FOUND', message: 'Guild has no bot installed' } })
		);

		await expect(mintInvite(GUILD_ID, 'viewer')).resolves.toEqual({
			status: 'error',
			message: 'Guild has no bot installed'
		});
	});
});

describe('revokeInvite', () => {
	it('addresses the single invite with DELETE', async () => {
		vi.mocked(fetch).mockResolvedValue({ ok: true, status: 204 } as Response);

		await revokeInvite(GUILD_ID, INVITE_ID);

		const [, init] = vi.mocked(fetch).mock.calls[0] ?? [];

		expect(urlOf()).toBe(`http://localhost:3001/guilds/${GUILD_ID}/invites/${INVITE_ID}`);
		expect(init?.method).toBe('DELETE');
	});

	it('reports a link that was already spent', async () => {
		vi.mocked(fetch).mockResolvedValue(
			json(410, {
				error: { code: 'INVITE_NOT_USABLE', message: 'That invite link was already used' }
			})
		);

		await expect(revokeInvite(GUILD_ID, INVITE_ID)).resolves.toEqual({
			status: 'error',
			message: 'That invite link was already used'
		});
	});
});

describe('acceptInvite', () => {
	it('posts to the redeem route, which is not scoped to a guild', async () => {
		vi.mocked(fetch).mockResolvedValue(
			json(201, { guildId: GUILD_ID, role: 'moderator', alreadyHadAccess: false })
		);

		await acceptInvite(TOKEN);

		const [, init] = vi.mocked(fetch).mock.calls[0] ?? [];

		expect(urlOf()).toBe(`http://localhost:3001/invites/${TOKEN}`);
		expect(init?.method).toBe('POST');
		expect(init?.credentials).toBe('include');
	});

	it('answers with the guild the person just joined', async () => {
		vi.mocked(fetch).mockResolvedValue(
			json(201, { guildId: GUILD_ID, role: 'moderator', alreadyHadAccess: false })
		);

		await expect(acceptInvite(TOKEN)).resolves.toEqual({
			status: 'accepted',
			accepted: { guildId: GUILD_ID, role: 'moderator', alreadyHadAccess: false }
		});
	});

	it('says why a spent link was refused', async () => {
		vi.mocked(fetch).mockResolvedValue(
			json(410, {
				error: { code: 'INVITE_NOT_USABLE', message: 'That invite link has expired' }
			})
		);

		await expect(acceptInvite(TOKEN)).resolves.toEqual({
			status: 'error',
			message: 'That invite link has expired'
		});
	});

	it('says the API could not be reached rather than throwing at the screen', async () => {
		vi.mocked(fetch).mockRejectedValue(new Error('fetch failed'));

		await expect(acceptInvite(TOKEN)).resolves.toEqual({
			status: 'error',
			message: 'fetch failed'
		});
	});
});
