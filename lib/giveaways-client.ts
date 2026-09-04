import { apiBaseUrl } from '@/lib/api-url';
import { describeFailure, type ErrorBody } from '@/lib/module-client';
import type { GiveawayDto, GiveawaysDto, StartGiveawayPayload } from '@/lib/modules/giveaways';
import type { GiveawayState } from '@/lib/types/module-configs';

export type GiveawaysResult =
	{ status: 'ok'; page: GiveawaysDto } | { status: 'error'; message: string };

export type GiveawayResult =
	{ status: 'ok'; giveaway: GiveawayDto } | { status: 'error'; message: string };

export type RemovalResult = { status: 'ok' } | { status: 'error'; message: string };

const giveawaysUrl = (guildId: string): string => `${apiBaseUrl()}/guilds/${guildId}/giveaways`;

export const giveawayQuery = (
	statuses: readonly GiveawayState[],
	limit: number,
	cursor: string | null = null
): string => {
	const params = new URLSearchParams({ limit: String(limit) });

	for (const status of statuses) {
		params.append('status', status);
	}

	if (cursor !== null) {
		params.set('cursor', cursor);
	}

	return params.toString();
};

async function failureOf(response: Response): Promise<string> {
	const body = (await response.json().catch(() => ({}))) as ErrorBody;

	return describeFailure(body, response.status);
}

function unreachable(error: unknown): string {
	return error instanceof Error ? error.message : 'The API could not be reached';
}

async function call(url: string, init?: RequestInit): Promise<Response | string> {
	try {
		return await fetch(url, { credentials: 'include', ...init });
	} catch (error) {
		return unreachable(error);
	}
}

async function one(url: string, init?: RequestInit): Promise<GiveawayResult> {
	const response = await call(url, init);

	if (typeof response === 'string') return { status: 'error', message: response };

	if (!response.ok) return { status: 'error', message: await failureOf(response) };

	return { status: 'ok', giveaway: (await response.json()) as GiveawayDto };
}

export async function loadGiveaways(
	guildId: string,
	statuses: readonly GiveawayState[] = [],
	limit = 25
): Promise<GiveawaysResult> {
	const response = await call(`${giveawaysUrl(guildId)}?${giveawayQuery(statuses, limit)}`);

	if (typeof response === 'string') return { status: 'error', message: response };

	if (!response.ok) return { status: 'error', message: await failureOf(response) };

	return { status: 'ok', page: (await response.json()) as GiveawaysDto };
}

export async function startGiveaway(
	guildId: string,
	payload: StartGiveawayPayload
): Promise<GiveawayResult> {
	return one(giveawaysUrl(guildId), {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(payload)
	});
}

export async function endGiveaway(guildId: string, giveawayId: string): Promise<GiveawayResult> {
	return one(`${giveawaysUrl(guildId)}/${giveawayId}/end`, { method: 'POST' });
}

export async function rerollGiveaway(guildId: string, giveawayId: string): Promise<GiveawayResult> {
	return one(`${giveawaysUrl(guildId)}/${giveawayId}/reroll`, { method: 'POST' });
}

export async function removeGiveaway(guildId: string, giveawayId: string): Promise<RemovalResult> {
	const response = await call(`${giveawaysUrl(guildId)}/${giveawayId}`, { method: 'DELETE' });

	if (typeof response === 'string') return { status: 'error', message: response };

	if (!response.ok) return { status: 'error', message: await failureOf(response) };

	return { status: 'ok' };
}
