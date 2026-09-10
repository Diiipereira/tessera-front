import { apiBaseUrl } from '@/lib/api-url';
import { failureFrom, unreachable, type ApiFailure, type ErrorBody } from '@/lib/api-errors';
import type { AutomodReading, AutomodRuleDto, AutomodRulePayload } from '@/lib/modules/automod';

export type RulesResult =
	{ status: 'ok'; rules: AutomodRuleDto[] } | { status: 'error'; failure: ApiFailure };

export type ReadingResult =
	{ status: 'ok'; reading: AutomodReading } | { status: 'error'; failure: ApiFailure };

const rulesUrl = (guildId: string): string => `${apiBaseUrl()}/guilds/${guildId}/automod`;

async function failureOf(response: Response): Promise<ApiFailure> {
	const body = (await response.json().catch(() => ({}))) as ErrorBody;

	return failureFrom(body, response.status);
}

export async function loadRules(guildId: string): Promise<RulesResult> {
	let response: Response;

	try {
		response = await fetch(rulesUrl(guildId), { credentials: 'include' });
	} catch (error) {
		return { status: 'error', failure: unreachable(error) };
	}

	if (!response.ok) return { status: 'error', failure: await failureOf(response) };

	const body = (await response.json()) as { rules: AutomodRuleDto[] };

	return { status: 'ok', rules: body.rules };
}

export async function saveRules(
	guildId: string,
	rules: readonly AutomodRulePayload[]
): Promise<RulesResult> {
	let response: Response;

	try {
		response = await fetch(rulesUrl(guildId), {
			method: 'PUT',
			credentials: 'include',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ rules })
		});
	} catch (error) {
		return { status: 'error', failure: unreachable(error) };
	}

	if (!response.ok) return { status: 'error', failure: await failureOf(response) };

	const body = (await response.json()) as { rules: AutomodRuleDto[] };

	return { status: 'ok', rules: body.rules };
}

export async function testMessage(
	guildId: string,
	content: string,
	rules: readonly AutomodRulePayload[],
	signal?: AbortSignal
): Promise<ReadingResult> {
	let response: Response;

	try {
		response = await fetch(`${rulesUrl(guildId)}/test`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ content, rules }),
			signal
		});
	} catch (error) {
		return { status: 'error', failure: unreachable(error) };
	}

	if (!response.ok) return { status: 'error', failure: await failureOf(response) };

	return { status: 'ok', reading: (await response.json()) as AutomodReading };
}
