import { apiBaseUrl } from '@/lib/api-url';
import { failureFrom, unreachable, type ApiFailure, type ErrorBody } from '@/lib/api-errors';

export type BotRemovalResult = { status: 'removed' } | { status: 'error'; failure: ApiFailure };

const botUrl = (guildId: string): string => `${apiBaseUrl()}/guilds/${guildId}/bot`;

export async function removeBot(guildId: string): Promise<BotRemovalResult> {
	let response: Response;

	try {
		response = await fetch(botUrl(guildId), { method: 'DELETE', credentials: 'include' });
	} catch (error) {
		return {
			status: 'error',
			failure: unreachable(error)
		};
	}

	if (response.ok) return { status: 'removed' };

	const failure = (await response.json().catch(() => ({}))) as ErrorBody;

	return { status: 'error', failure: failureFrom(failure, response.status) };
}

export type ConfigResetResult = { status: 'reset' } | { status: 'error'; failure: ApiFailure };

const resetUrl = (guildId: string): string => `${apiBaseUrl()}/guilds/${guildId}/modules/reset`;

export async function resetAllModules(guildId: string): Promise<ConfigResetResult> {
	let response: Response;

	try {
		response = await fetch(resetUrl(guildId), { method: 'POST', credentials: 'include' });
	} catch (error) {
		return {
			status: 'error',
			failure: unreachable(error)
		};
	}

	if (response.ok) return { status: 'reset' };

	const failure = (await response.json().catch(() => ({}))) as ErrorBody;

	return { status: 'error', failure: failureFrom(failure, response.status) };
}
