import { apiBaseUrl } from '@/lib/api-url';
import { describeFailure, type ErrorBody } from '@/lib/module-client';
import type { ReactionPanelDto, ReactionPanelPayload } from '@/lib/modules/reaction-roles';

export type PanelsResult =
	{ status: 'ok'; panels: ReactionPanelDto[] } | { status: 'error'; message: string };

const panelsUrl = (guildId: string): string => `${apiBaseUrl()}/guilds/${guildId}/reaction-roles`;

async function failureOf(response: Response): Promise<string> {
	const body = (await response.json().catch(() => ({}))) as ErrorBody;

	return describeFailure(body, response.status);
}

function unreachable(error: unknown): string {
	return error instanceof Error ? error.message : 'The API could not be reached';
}

export async function loadPanels(guildId: string): Promise<PanelsResult> {
	let response: Response;

	try {
		response = await fetch(panelsUrl(guildId), { credentials: 'include' });
	} catch (error) {
		return { status: 'error', message: unreachable(error) };
	}

	if (!response.ok) return { status: 'error', message: await failureOf(response) };

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
		return { status: 'error', message: unreachable(error) };
	}

	if (!response.ok) return { status: 'error', message: await failureOf(response) };

	const body = (await response.json()) as { panels: ReactionPanelDto[] };

	return { status: 'ok', panels: body.panels };
}
