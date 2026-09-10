import { apiBaseUrl } from '@/lib/api-url';
import { failureFrom, unreachable, type ApiFailure, type ErrorBody } from '@/lib/api-errors';
import type { LogDestinationDto, LogRoutePayload } from '@/lib/modules/logging';

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
