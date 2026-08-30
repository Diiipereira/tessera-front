import { apiBaseUrl } from '@/lib/api-url';
import { describeFailure, type ErrorBody } from '@/lib/module-client';
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
	{ status: 'ok'; ladder: EscalationLadder } | { status: 'error'; message: string };

export type RuleResult = { status: 'ok' } | { status: 'error'; message: string };

const ladderUrl = (guildId: string): string => `${apiBaseUrl()}/guilds/${guildId}/escalation`;

async function failureOf(response: Response): Promise<string> {
	const body = (await response.json().catch(() => ({}))) as ErrorBody;

	return describeFailure(body, response.status);
}

export async function loadLadder(guildId: string): Promise<LadderResult> {
	let response: Response;

	try {
		response = await fetch(ladderUrl(guildId), { credentials: 'include' });
	} catch (error) {
		return {
			status: 'error',
			message: error instanceof Error ? error.message : 'The API could not be reached'
		};
	}

	if (!response.ok) return { status: 'error', message: await failureOf(response) };

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
			message: error instanceof Error ? error.message : 'The API could not be reached'
		};
	}

	if (!response.ok) return { status: 'error', message: await failureOf(response) };

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
			message: error instanceof Error ? error.message : 'The API could not be reached'
		};
	}

	if (!response.ok) return { status: 'error', message: await failureOf(response) };

	return { status: 'ok' };
}
