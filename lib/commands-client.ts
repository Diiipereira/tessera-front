import { apiBaseUrl } from '@/lib/api-url';
import { windowParams, type CommandReportDto, type UsageWindow } from '@/lib/command-report';
import { failureFrom, unreachable, type ApiFailure, type ErrorBody } from '@/lib/api-errors';

export type CommandLoadResult =
	{ status: 'loaded'; report: CommandReportDto } | { status: 'error'; failure: ApiFailure };

export const commandsUrl = (guildId: string, days: UsageWindow): string =>
	`${apiBaseUrl()}/guilds/${guildId}/commands?${windowParams(days).toString()}`;

export async function loadCommands(guildId: string, days: UsageWindow): Promise<CommandLoadResult> {
	let response: Response;

	try {
		response = await fetch(commandsUrl(guildId, days), {
			credentials: 'include',
			cache: 'no-store'
		});
	} catch (error) {
		return {
			status: 'error',
			failure: unreachable(error)
		};
	}

	if (response.ok) {
		return { status: 'loaded', report: (await response.json()) as CommandReportDto };
	}

	const failure = (await response.json().catch(() => ({}))) as ErrorBody;

	return { status: 'error', failure: failureFrom(failure, response.status) };
}
