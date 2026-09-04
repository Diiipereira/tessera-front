import { apiBaseUrl } from '@/lib/api-url';
import { describeFailure, type ErrorBody } from '@/lib/module-client';
import type { TicketPanelDto, TicketPanelPayload, TicketsDto } from '@/lib/modules/tickets';
import type { TicketStatus } from '@/lib/types/module-configs';

export type PanelsResult =
	{ status: 'ok'; panels: TicketPanelDto[] } | { status: 'error'; message: string };

export type TicketsResult =
	{ status: 'ok'; page: TicketsDto } | { status: 'error'; message: string };

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

async function failureOf(response: Response): Promise<string> {
	const body = (await response.json().catch(() => ({}))) as ErrorBody;

	return describeFailure(body, response.status);
}

function unreachable(error: unknown): string {
	return error instanceof Error ? error.message : 'The API could not be reached';
}

async function call(url: string, init?: RequestInit): Promise<Response | string> {
	try {
		return await fetch(url, { credentials: 'include', ...init });
	} catch (error) {
		return unreachable(error);
	}
}

export async function loadPanels(guildId: string): Promise<PanelsResult> {
	const response = await call(`${ticketsUrl(guildId)}/panels`);

	if (typeof response === 'string') return { status: 'error', message: response };

	if (!response.ok) return { status: 'error', message: await failureOf(response) };

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

	if (typeof response === 'string') return { status: 'error', message: response };

	if (!response.ok) return { status: 'error', message: await failureOf(response) };

	const body = (await response.json()) as { panels: TicketPanelDto[] };

	return { status: 'ok', panels: body.panels };
}

export async function loadTickets(
	guildId: string,
	statuses: readonly TicketStatus[] = LIVE_STATUSES,
	limit = 25
): Promise<TicketsResult> {
	const response = await call(`${ticketsUrl(guildId)}?${ticketQuery(statuses, limit)}`);

	if (typeof response === 'string') return { status: 'error', message: response };

	if (!response.ok) return { status: 'error', message: await failureOf(response) };

	return { status: 'ok', page: (await response.json()) as TicketsDto };
}
