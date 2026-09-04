import { apiBaseUrl } from '@/lib/api-url';
import { describeFailure, type ErrorBody } from '@/lib/module-client';
import type { LogDestinationDto, LogRoutePayload } from '@/lib/modules/logging';

export type RoutesResult =
	{ status: 'ok'; events: LogDestinationDto[] } | { status: 'error'; message: string };

const routesUrl = (guildId: string): string => `${apiBaseUrl()}/guilds/${guildId}/logging`;

async function failureOf(response: Response): Promise<string> {
	const body = (await response.json().catch(() => ({}))) as ErrorBody;

	return describeFailure(body, response.status);
}

export async function loadRoutes(guildId: string): Promise<RoutesResult> {
	let response: Response;

	try {
		response = await fetch(routesUrl(guildId), { credentials: 'include' });
	} catch (error) {
		return {
			status: 'error',
			message: error instanceof Error ? error.message : 'The API could not be reached'
		};
	}

	if (!response.ok) return { status: 'error', message: await failureOf(response) };

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
			message: error instanceof Error ? error.message : 'The API could not be reached'
		};
	}

	if (!response.ok) return { status: 'error', message: await failureOf(response) };

	const body = (await response.json()) as { events: LogDestinationDto[] };

	return { status: 'ok', events: body.events };
}
