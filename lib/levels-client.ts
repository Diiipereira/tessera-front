import { apiBaseUrl } from '@/lib/api-url';
import { failureFrom, unreachable, type ApiFailure, type ErrorBody } from '@/lib/api-errors';
import type { LeaderboardDto, LevelRewardDto } from '@/lib/modules/levels';

export type RewardsResult =
	{ status: 'ok'; rewards: LevelRewardDto[] } | { status: 'error'; failure: ApiFailure };

export type BoardResult =
	{ status: 'ok'; board: LeaderboardDto } | { status: 'error'; failure: ApiFailure };

export type ClearResult =
	{ status: 'ok'; cleared: number } | { status: 'error'; failure: ApiFailure };

const levelsUrl = (guildId: string): string => `${apiBaseUrl()}/guilds/${guildId}/levels`;

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

export async function loadRewards(guildId: string): Promise<RewardsResult> {
	const response = await call(`${levelsUrl(guildId)}/rewards`);

	if (!(response instanceof Response)) return { status: 'error', failure: response };

	if (!response.ok) return { status: 'error', failure: await failureOf(response) };

	const body = (await response.json()) as { rewards: LevelRewardDto[] };

	return { status: 'ok', rewards: body.rewards };
}

export async function saveRewards(
	guildId: string,
	rewards: readonly LevelRewardDto[]
): Promise<RewardsResult> {
	const response = await call(`${levelsUrl(guildId)}/rewards`, {
		method: 'PUT',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ rewards })
	});

	if (!(response instanceof Response)) return { status: 'error', failure: response };

	if (!response.ok) return { status: 'error', failure: await failureOf(response) };

	const body = (await response.json()) as { rewards: LevelRewardDto[] };

	return { status: 'ok', rewards: body.rewards };
}

export async function loadLeaderboard(guildId: string, limit = 10): Promise<BoardResult> {
	const response = await call(`${levelsUrl(guildId)}/leaderboard?limit=${String(limit)}`);

	if (!(response instanceof Response)) return { status: 'error', failure: response };

	if (!response.ok) return { status: 'error', failure: await failureOf(response) };

	return { status: 'ok', board: (await response.json()) as LeaderboardDto };
}

export async function clearLevels(guildId: string): Promise<ClearResult> {
	const response = await call(`${levelsUrl(guildId)}/members`, { method: 'DELETE' });

	if (!(response instanceof Response)) return { status: 'error', failure: response };

	if (!response.ok) return { status: 'error', failure: await failureOf(response) };

	const body = (await response.json()) as { cleared: number };

	return { status: 'ok', cleared: body.cleared };
}
