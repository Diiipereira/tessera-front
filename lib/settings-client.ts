import { apiBaseUrl } from '@/lib/api-url';
import { describeFailure } from '@/lib/module-client';
import type { GuildSettings } from '@/lib/types/management';

export type SettingsWriteResult =
	{ status: 'saved'; settings: GuildSettings } | { status: 'error'; message: string };

const settingsUrl = (guildId: string): string => `${apiBaseUrl()}/guilds/${guildId}/settings`;

export async function patchSettings(
	guildId: string,
	body: Partial<GuildSettings>
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
			message: error instanceof Error ? error.message : 'The API could not be reached'
		};
	}

	if (response.ok) {
		return { status: 'saved', settings: (await response.json()) as GuildSettings };
	}

	return {
		status: 'error',
		message: describeFailure(await response.json().catch(() => ({})), response.status)
	};
}
