import { apiBaseUrl } from '@/lib/api-url';
import { failureFrom, unreachable, type ApiFailure, type ErrorBody } from '@/lib/api-errors';
import type { EmbedDraft } from '@/lib/types/modules';

export type EmbedSendOutcome = 'sent' | 'channel-refused';

export type EmbedSendResult =
	{ status: 'ok'; outcome: EmbedSendOutcome } | { status: 'error'; failure: ApiFailure };

export type EmbedSendPayload = {
	channelId: string;
	content: string;
	embed: Partial<EmbedDraft>;
};

export async function sendEmbed(
	guildId: string,
	payload: EmbedSendPayload
): Promise<EmbedSendResult> {
	let response: Response;

	try {
		response = await fetch(`${apiBaseUrl()}/guilds/${guildId}/embeds/send`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(payload)
		});
	} catch (error) {
		return { status: 'error', failure: unreachable(error) };
	}

	if (!response.ok) {
		const body = (await response.json().catch(() => ({}))) as ErrorBody;

		return { status: 'error', failure: failureFrom(body, response.status) };
	}

	const body = (await response.json()) as { outcome: EmbedSendOutcome };

	return { status: 'ok', outcome: body.outcome };
}
