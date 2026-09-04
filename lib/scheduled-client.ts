import { apiBaseUrl } from '@/lib/api-url';
import { describeFailure, type ErrorBody } from '@/lib/module-client';
import type { ScheduledMessagePayload, ScheduledMessagesDto } from '@/lib/modules/scheduled';

export type ScheduledResult =
	{ status: 'ok'; page: ScheduledMessagesDto } | { status: 'error'; message: string };

const scheduledUrl = (guildId: string): string => `${apiBaseUrl()}/guilds/${guildId}/scheduled`;

async function failureOf(response: Response): Promise<string> {
	const body = (await response.json().catch(() => ({}))) as ErrorBody;

	return describeFailure(body, response.status);
}

async function call(url: string, init?: RequestInit): Promise<Response | string> {
	try {
		return await fetch(url, { credentials: 'include', ...init });
	} catch (error) {
		return error instanceof Error ? error.message : 'The API could not be reached';
	}
}

async function page(url: string, init?: RequestInit): Promise<ScheduledResult> {
	const response = await call(url, init);

	if (typeof response === 'string') return { status: 'error', message: response };

	if (!response.ok) return { status: 'error', message: await failureOf(response) };

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
