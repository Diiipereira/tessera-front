import { apiBaseUrl } from '@/lib/api-url';
import { failureFrom, unreachable, type ApiFailure, type ErrorBody } from '@/lib/api-errors';
import type { GiveawayDto, GiveawaysDto, StartGiveawayPayload } from '@/lib/modules/giveaways';
import type { GiveawayState } from '@/lib/types/module-configs';

export type GiveawaysResult =
	{ status: 'ok'; page: GiveawaysDto } | { status: 'error'; failure: ApiFailure };

export type GiveawayResult =
	{ status: 'ok'; giveaway: GiveawayDto } | { status: 'error'; failure: ApiFailure };

export type RemovalResult = { status: 'ok' } | { status: 'error'; failure: ApiFailure };

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

async function failureOf(response: Response): Promise<ApiFailure> {
	const body = (await response.json().catch(() => ({}))) as ErrorBody;

	return failureFrom(body, response.status);
}

async function call(url: string, init?: RequestInit): Promise<Response | ApiFailure> {
	try {
		return await fetch(url, { credentials: 'include', ...init });
	} catch (error) {
		return unreachable(error);
	}
}

async function one(url: string, init?: RequestInit): Promise<GiveawayResult> {
	const response = await call(url, init);

	if (!(response instanceof Response)) return { status: 'error', failure: response };

	if (!response.ok) return { status: 'error', failure: await failureOf(response) };

	return { status: 'ok', giveaway: (await response.json()) as GiveawayDto };
}

export async function loadGiveaways(
	guildId: string,
	statuses: readonly GiveawayState[] = [],
	limit = 25
): Promise<GiveawaysResult> {
	const response = await call(`${giveawaysUrl(guildId)}?${giveawayQuery(statuses, limit)}`);

	if (!(response instanceof Response)) return { status: 'error', failure: response };

	if (!response.ok) return { status: 'error', failure: await failureOf(response) };

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

	if (!(response instanceof Response)) return { status: 'error', failure: response };

	if (!response.ok) return { status: 'error', failure: await failureOf(response) };

	return { status: 'ok' };
}
