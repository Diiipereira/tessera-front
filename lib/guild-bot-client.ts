import { apiBaseUrl } from '@/lib/api-url';
import { describeFailure, type ErrorBody } from '@/lib/module-client';

export type BotRemovalResult = { status: 'removed' } | { status: 'error'; message: string };

const botUrl = (guildId: string): string => `${apiBaseUrl()}/guilds/${guildId}/bot`;

export async function removeBot(guildId: string): Promise<BotRemovalResult> {
	let response: Response;

	try {
		response = await fetch(botUrl(guildId), { method: 'DELETE', credentials: 'include' });
	} catch (error) {
		return {
			status: 'error',
			message: error instanceof Error ? error.message : 'The API could not be reached'
		};
	}

	if (response.ok) return { status: 'removed' };

	const failure = (await response.json().catch(() => ({}))) as ErrorBody;

	return { status: 'error', message: describeFailure(failure, response.status) };
}
