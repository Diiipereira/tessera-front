import { apiBaseUrl } from '@/lib/api-url';
import { failureFrom, unreachable, type ApiFailure, type ErrorBody } from '@/lib/api-errors';
import type { ApiEmbedDto } from '@/lib/modules/log-preview';
import type { GameAlertDraftBody } from '@/lib/modules/game-alerts';

export type GameAlertOfferDto = {
	store: string;
	title: string;
	url: string;
	imageUrl: string | null;
	startsAt: string;
	endsAt: string;
};

export type GameAlertSenderDto = {
	name: string;
	avatarUrl: string | null;
};

export type GameAlertLinkDto = {
	type: number;
	style: number;
	label: string;
	url: string;
};

export type GameAlertLinkRowDto = {
	type: number;
	components: GameAlertLinkDto[];
};

export type GameAlertPreviewDto = {
	sender: GameAlertSenderDto;
	content: string;
	embeds: ApiEmbedDto[];
	components: GameAlertLinkRowDto[];
	spacingMinutes: number;
	running: GameAlertOfferDto[];
	upcoming: GameAlertOfferDto[];
};

export type GameAlertPreviewResult =
	{ status: 'ok'; preview: GameAlertPreviewDto } | { status: 'error'; failure: ApiFailure };

export type GameAlertTestOutcome =
	'sent' | 'sent-as-bot' | 'not-ready' | 'no-offer' | 'channel-refused';

export type GameAlertTestResult =
	{ status: 'ok'; outcome: GameAlertTestOutcome } | { status: 'error'; failure: ApiFailure };

const alertsUrl = (guildId: string): string => `${apiBaseUrl()}/guilds/${guildId}/game-alerts`;

async function failureOf(response: Response): Promise<ApiFailure> {
	const body = (await response.json().catch(() => ({}))) as ErrorBody;

	return failureFrom(body, response.status);
}

export async function previewGameAlert(
	guildId: string,
	draft: GameAlertDraftBody,
	signal?: AbortSignal
): Promise<GameAlertPreviewResult> {
	let response: Response;

	try {
		response = await fetch(`${alertsUrl(guildId)}/preview`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(draft),
			signal
		});
	} catch (error) {
		return { status: 'error', failure: unreachable(error) };
	}

	if (!response.ok) return { status: 'error', failure: await failureOf(response) };

	return { status: 'ok', preview: (await response.json()) as GameAlertPreviewDto };
}

export async function sendGameAlertTest(guildId: string): Promise<GameAlertTestResult> {
	let response: Response;

	try {
		response = await fetch(`${alertsUrl(guildId)}/test`, {
			method: 'POST',
			credentials: 'include'
		});
	} catch (error) {
		return { status: 'error', failure: unreachable(error) };
	}

	if (!response.ok) return { status: 'error', failure: await failureOf(response) };

	const body = (await response.json()) as { outcome: GameAlertTestOutcome };

	return { status: 'ok', outcome: body.outcome };
}
