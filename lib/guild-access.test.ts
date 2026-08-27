import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApiResult } from '@/lib/api';
import type { GuildListDto } from '@/lib/api-url';

const answer = vi.hoisted(() => ({ current: null as ApiResult<GuildListDto> | null }));

const notFound = vi.hoisted(() =>
	vi.fn(() => {
		throw new Error('NEXT_NOT_FOUND');
	})
);

const redirect = vi.hoisted(() =>
	vi.fn((to: string) => {
		throw new Error(`NEXT_REDIRECT:${to}`);
	})
);

vi.mock('next/navigation', () => ({ notFound, redirect }));

vi.mock('@/lib/api', () => ({
	apiGet: () => Promise.resolve(answer.current)
}));

const card = (id: string, name: string) => ({
	id,
	name,
	iconHash: null,
	owner: true,
	memberCount: 3,
	planKey: 'free'
});

const MANAGED = '931562055025168435';
const AVAILABLE = '842315097461823104';

describe('resolveGuild', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
		answer.current = {
			status: 'ok',
			data: {
				managed: [card(MANAGED, 'Tessera Dev')],
				available: [card(AVAILABLE, 'Pixel Foundry')]
			}
		};
	});

	const load = async () => import('./guild-access');

	it('returns the guild the bot is actually in, with its real name', async () => {
		const { resolveGuild } = await load();
		const guild = await resolveGuild(MANAGED);

		expect(guild.name).toBe('Tessera Dev');
		expect(guild.hasBot).toBe(true);
	});

	it('sends an admin whose server has no bot to the install flow, not to a 404', async () => {
		const { resolveGuild } = await load();

		await expect(resolveGuild(AVAILABLE)).rejects.toThrow(
			`NEXT_REDIRECT:/servers/add?guild=${AVAILABLE}`
		);
		expect(notFound).not.toHaveBeenCalled();
	});

	it('names the guild in the install redirect, so the wait screen knows who it waits for', async () => {
		const { lookupPendingGuild } = await load();

		await expect(lookupPendingGuild(AVAILABLE)).resolves.toEqual(
			expect.objectContaining({ name: 'Pixel Foundry', hasBot: false })
		);
		await expect(lookupPendingGuild(MANAGED)).resolves.toBeNull();
	});

	it('is a 404 for a server the signed-in user cannot see at all', async () => {
		const { resolveGuild } = await load();

		await expect(resolveGuild('556677889900112233')).rejects.toThrow('NEXT_NOT_FOUND');
	});

	it('sends an unauthenticated visitor to the login page', async () => {
		answer.current = { status: 'unauthenticated' };

		const { resolveGuild } = await load();

		await expect(resolveGuild(MANAGED)).rejects.toThrow('NEXT_REDIRECT:/login');
	});

	it('names the API when it cannot be reached, instead of pretending the guild is gone', async () => {
		answer.current = { status: 'unreachable', reason: 'connect ECONNREFUSED' };

		const { resolveGuild } = await load();

		await expect(resolveGuild(MANAGED)).rejects.toThrow('connect ECONNREFUSED');
		expect(notFound).not.toHaveBeenCalled();
	});
});

describe('lookupGuild', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
		answer.current = {
			status: 'ok',
			data: { managed: [card(MANAGED, 'Tessera Dev')], available: [] }
		};
	});

	it('answers with null instead of throwing, so page titles never break the render', async () => {
		const { lookupGuild } = await import('./guild-access');

		await expect(lookupGuild('556677889900112233')).resolves.toBeNull();
		await expect(lookupGuild(MANAGED)).resolves.toEqual(
			expect.objectContaining({ name: 'Tessera Dev' })
		);
	});
});
