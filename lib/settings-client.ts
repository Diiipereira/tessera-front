import { apiBaseUrl } from '@/lib/api-url';
import { failureFrom, unreachable, type ApiFailure, type ErrorBody } from '@/lib/api-errors';
import type { GuildSettingsDto, GuildSettingsPatch } from '@/lib/types/management';

export type SettingsWriteResult =
	{ status: 'saved'; settings: GuildSettingsDto } | { status: 'error'; failure: ApiFailure };

const settingsUrl = (guildId: string): string => `${apiBaseUrl()}/guilds/${guildId}/settings`;

export async function patchSettings(
	guildId: string,
	body: GuildSettingsPatch
): Promise<SettingsWriteResult> {
	let response: Response;

	try {
		response = await fetch(settingsUrl(guildId), {
			method: 'PATCH',
			credentials: 'include',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body)
		});
	} catch (error) {
		return {
			status: 'error',
			failure: unreachable(error)
		};
	}

	if (response.ok) {
		return { status: 'saved', settings: (await response.json()) as GuildSettingsDto };
	}

	const failure = (await response.json().catch(() => ({}))) as ErrorBody;

	return { status: 'error', failure: failureFrom(failure, response.status) };
}
