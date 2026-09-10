import { apiBaseUrl } from '@/lib/api-url';
import { failureFrom, unreachable, type ApiFailure, type ErrorBody } from '@/lib/api-errors';
import type { LogDestinationDto, LogRoutePayload, LogTemplate } from '@/lib/modules/logging';
import type { LogPreviewDto } from '@/lib/modules/log-preview';

export type RoutesResult =
	{ status: 'ok'; events: LogDestinationDto[] } | { status: 'error'; failure: ApiFailure };

const routesUrl = (guildId: string): string => `${apiBaseUrl()}/guilds/${guildId}/logging`;

async function failureOf(response: Response): Promise<ApiFailure> {
	const body = (await response.json().catch(() => ({}))) as ErrorBody;

	return failureFrom(body, response.status);
}

export async function loadRoutes(guildId: string): Promise<RoutesResult> {
	let response: Response;

	try {
		response = await fetch(routesUrl(guildId), { credentials: 'include' });
	} catch (error) {
		return {
			status: 'error',
			failure: unreachable(error)
		};
	}

	if (!response.ok) return { status: 'error', failure: await failureOf(response) };

	const body = (await response.json()) as { events: LogDestinationDto[] };

	return { status: 'ok', events: body.events };
}

export async function saveRoutes(
	guildId: string,
	events: readonly LogRoutePayload[]
): Promise<RoutesResult> {
	let response: Response;

	try {
		response = await fetch(routesUrl(guildId), {
			method: 'PUT',
			credentials: 'include',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ events })
		});
	} catch (error) {
		return {
			status: 'error',
			failure: unreachable(error)
		};
	}

	if (!response.ok) return { status: 'error', failure: await failureOf(response) };

	const body = (await response.json()) as { events: LogDestinationDto[] };

	return { status: 'ok', events: body.events };
}

export type PreviewResult =
	{ status: 'ok'; preview: LogPreviewDto } | { status: 'error'; failure: ApiFailure };

export async function previewTemplate(
	guildId: string,
	eventType: string,
	template: LogTemplate | null,
	signal?: AbortSignal
): Promise<PreviewResult> {
	let response: Response;

	try {
		response = await fetch(`${routesUrl(guildId)}/preview`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ eventType, template }),
			signal
		});
	} catch (error) {
		return { status: 'error', failure: unreachable(error) };
	}

	if (!response.ok) return { status: 'error', failure: await failureOf(response) };

	return { status: 'ok', preview: (await response.json()) as LogPreviewDto };
}

export type LogTestOutcome = 'sent' | 'not-ready' | 'channel-refused';

export type LogTestResult =
	{ status: 'ok'; outcome: LogTestOutcome } | { status: 'error'; failure: ApiFailure };

export async function sendLogTest(guildId: string, eventType: string): Promise<LogTestResult> {
	let response: Response;

	try {
		response = await fetch(`${routesUrl(guildId)}/test`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ eventType })
		});
	} catch (error) {
		return { status: 'error', failure: unreachable(error) };
	}

	if (!response.ok) return { status: 'error', failure: await failureOf(response) };

	const body = (await response.json()) as { outcome: LogTestOutcome };

	return { status: 'ok', outcome: body.outcome };
}
