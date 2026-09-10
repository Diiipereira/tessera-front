import { apiBaseUrl } from '@/lib/api-url';
import { failureFrom, unreachable, type ApiFailure, type ErrorBody } from '@/lib/api-errors';
import type { ReactionPanelDto, ReactionPanelPayload } from '@/lib/modules/reaction-roles';

export type PanelsResult =
	{ status: 'ok'; panels: ReactionPanelDto[] } | { status: 'error'; failure: ApiFailure };

const panelsUrl = (guildId: string): string => `${apiBaseUrl()}/guilds/${guildId}/reaction-roles`;

async function failureOf(response: Response): Promise<ApiFailure> {
	const body = (await response.json().catch(() => ({}))) as ErrorBody;

	return failureFrom(body, response.status);
}

export async function loadPanels(guildId: string): Promise<PanelsResult> {
	let response: Response;

	try {
		response = await fetch(panelsUrl(guildId), { credentials: 'include' });
	} catch (error) {
		return { status: 'error', failure: unreachable(error) };
	}

	if (!response.ok) return { status: 'error', failure: await failureOf(response) };

	const body = (await response.json()) as { panels: ReactionPanelDto[] };

	return { status: 'ok', panels: body.panels };
}

export async function savePanels(
	guildId: string,
	panels: readonly ReactionPanelPayload[]
): Promise<PanelsResult> {
	let response: Response;

	try {
		response = await fetch(panelsUrl(guildId), {
			method: 'PUT',
			credentials: 'include',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ panels })
		});
	} catch (error) {
		return { status: 'error', failure: unreachable(error) };
	}

	if (!response.ok) return { status: 'error', failure: await failureOf(response) };

	const body = (await response.json()) as { panels: ReactionPanelDto[] };

	return { status: 'ok', panels: body.panels };
}
