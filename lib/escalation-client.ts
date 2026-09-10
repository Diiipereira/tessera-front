import { apiBaseUrl } from '@/lib/api-url';
import { failureFrom, unreachable, type ApiFailure, type ErrorBody } from '@/lib/api-errors';
import type { AutoAction } from '@/lib/modules/moderation';

export type EscalationRule = {
	id: string;
	threshold: number;
	action: AutoAction;
	durationSeconds: number | null;
};

export type EscalationLadder = {
	rules: EscalationRule[];
	windowDays: number;
};

export type LadderResult =
	{ status: 'ok'; ladder: EscalationLadder } | { status: 'error'; failure: ApiFailure };

export type RuleResult = { status: 'ok' } | { status: 'error'; failure: ApiFailure };

const ladderUrl = (guildId: string): string => `${apiBaseUrl()}/guilds/${guildId}/escalation`;

async function failureOf(response: Response): Promise<ApiFailure> {
	const body = (await response.json().catch(() => ({}))) as ErrorBody;

	return failureFrom(body, response.status);
}

export async function loadLadder(guildId: string): Promise<LadderResult> {
	let response: Response;

	try {
		response = await fetch(ladderUrl(guildId), { credentials: 'include' });
	} catch (error) {
		return {
			status: 'error',
			failure: unreachable(error)
		};
	}

	if (!response.ok) return { status: 'error', failure: await failureOf(response) };

	return { status: 'ok', ladder: (await response.json()) as EscalationLadder };
}

export async function addRule(
	guildId: string,
	rule: { threshold: number; action: AutoAction; durationSeconds: number | null }
): Promise<RuleResult> {
	let response: Response;

	try {
		response = await fetch(ladderUrl(guildId), {
			method: 'POST',
			credentials: 'include',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(rule)
		});
	} catch (error) {
		return {
			status: 'error',
			failure: unreachable(error)
		};
	}

	if (!response.ok) return { status: 'error', failure: await failureOf(response) };

	return { status: 'ok' };
}

export async function removeRule(guildId: string, threshold: number): Promise<RuleResult> {
	let response: Response;

	try {
		response = await fetch(`${ladderUrl(guildId)}/${String(threshold)}`, {
			method: 'DELETE',
			credentials: 'include'
		});
	} catch (error) {
		return {
			status: 'error',
			failure: unreachable(error)
		};
	}

	if (!response.ok) return { status: 'error', failure: await failureOf(response) };

	return { status: 'ok' };
}
