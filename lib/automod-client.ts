import { apiBaseUrl } from '@/lib/api-url';
import { describeFailure, type ErrorBody } from '@/lib/module-client';
import type { AutomodReading, AutomodRuleDto, AutomodRulePayload } from '@/lib/modules/automod';

export type RulesResult =
	{ status: 'ok'; rules: AutomodRuleDto[] } | { status: 'error'; message: string };

export type ReadingResult =
	{ status: 'ok'; reading: AutomodReading } | { status: 'error'; message: string };

const rulesUrl = (guildId: string): string => `${apiBaseUrl()}/guilds/${guildId}/automod`;

async function failureOf(response: Response): Promise<string> {
	const body = (await response.json().catch(() => ({}))) as ErrorBody;

	return describeFailure(body, response.status);
}

function unreachable(error: unknown): string {
	return error instanceof Error ? error.message : 'The API could not be reached';
}

export async function loadRules(guildId: string): Promise<RulesResult> {
	let response: Response;

	try {
		response = await fetch(rulesUrl(guildId), { credentials: 'include' });
	} catch (error) {
		return { status: 'error', message: unreachable(error) };
	}

	if (!response.ok) return { status: 'error', message: await failureOf(response) };

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
		return { status: 'error', message: unreachable(error) };
	}

	if (!response.ok) return { status: 'error', message: await failureOf(response) };

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
		return { status: 'error', message: unreachable(error) };
	}

	if (!response.ok) return { status: 'error', message: await failureOf(response) };

	return { status: 'ok', reading: (await response.json()) as AutomodReading };
}
