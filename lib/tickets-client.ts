import { apiBaseUrl } from '@/lib/api-url';
import { failureFrom, unreachable, type ApiFailure, type ErrorBody } from '@/lib/api-errors';
import type { TicketPanelDto, TicketPanelPayload, TicketsDto } from '@/lib/modules/tickets';
import type { TicketStatus } from '@/lib/types/module-configs';

export type PanelsResult =
	{ status: 'ok'; panels: TicketPanelDto[] } | { status: 'error'; failure: ApiFailure };

export type TicketsResult =
	{ status: 'ok'; page: TicketsDto } | { status: 'error'; failure: ApiFailure };

const ticketsUrl = (guildId: string): string => `${apiBaseUrl()}/guilds/${guildId}/tickets`;

export const LIVE_STATUSES: readonly TicketStatus[] = ['open', 'claimed'];

export const ticketQuery = (
	statuses: readonly TicketStatus[],
	limit: number,
	cursor: number | null = null
): string => {
	const params = new URLSearchParams({ limit: String(limit) });

	for (const status of statuses) {
		params.append('status', status);
	}

	if (cursor !== null) {
		params.set('cursor', String(cursor));
	}

	return params.toString();
};

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

export async function loadPanels(guildId: string): Promise<PanelsResult> {
	const response = await call(`${ticketsUrl(guildId)}/panels`);

	if (!(response instanceof Response)) return { status: 'error', failure: response };

	if (!response.ok) return { status: 'error', failure: await failureOf(response) };

	const body = (await response.json()) as { panels: TicketPanelDto[] };

	return { status: 'ok', panels: body.panels };
}

export async function savePanels(
	guildId: string,
	panels: readonly TicketPanelPayload[]
): Promise<PanelsResult> {
	const response = await call(`${ticketsUrl(guildId)}/panels`, {
		method: 'PUT',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ panels })
	});

	if (!(response instanceof Response)) return { status: 'error', failure: response };

	if (!response.ok) return { status: 'error', failure: await failureOf(response) };

	const body = (await response.json()) as { panels: TicketPanelDto[] };

	return { status: 'ok', panels: body.panels };
}

export async function loadTickets(
	guildId: string,
	statuses: readonly TicketStatus[] = LIVE_STATUSES,
	limit = 25
): Promise<TicketsResult> {
	const response = await call(`${ticketsUrl(guildId)}?${ticketQuery(statuses, limit)}`);

	if (!(response instanceof Response)) return { status: 'error', failure: response };

	if (!response.ok) return { status: 'error', failure: await failureOf(response) };

	return { status: 'ok', page: (await response.json()) as TicketsDto };
}
