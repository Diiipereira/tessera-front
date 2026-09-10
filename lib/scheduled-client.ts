import { apiBaseUrl } from '@/lib/api-url';
import { failureFrom, unreachable, type ApiFailure, type ErrorBody } from '@/lib/api-errors';
import type { ScheduledMessagePayload, ScheduledMessagesDto } from '@/lib/modules/scheduled';

export type ScheduledResult =
	{ status: 'ok'; page: ScheduledMessagesDto } | { status: 'error'; failure: ApiFailure };

const scheduledUrl = (guildId: string): string => `${apiBaseUrl()}/guilds/${guildId}/scheduled`;

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

async function page(url: string, init?: RequestInit): Promise<ScheduledResult> {
	const response = await call(url, init);

	if (!(response instanceof Response)) return { status: 'error', failure: response };

	if (!response.ok) return { status: 'error', failure: await failureOf(response) };

	return { status: 'ok', page: (await response.json()) as ScheduledMessagesDto };
}

export async function loadScheduled(guildId: string): Promise<ScheduledResult> {
	return page(scheduledUrl(guildId));
}

export async function saveScheduled(
	guildId: string,
	messages: readonly ScheduledMessagePayload[]
): Promise<ScheduledResult> {
	return page(scheduledUrl(guildId), {
		method: 'PUT',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ messages })
	});
}
