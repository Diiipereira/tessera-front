import { apiBaseUrl } from '@/lib/api-url';
import { windowParams, type CommandReportDto, type UsageWindow } from '@/lib/command-report';
import { describeFailure, type ErrorBody } from '@/lib/module-client';

export type CommandLoadResult =
	{ status: 'loaded'; report: CommandReportDto } | { status: 'error'; message: string };

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
			message: error instanceof Error ? error.message : 'The API could not be reached'
		};
	}

	if (response.ok) {
		return { status: 'loaded', report: (await response.json()) as CommandReportDto };
	}

	const failure = (await response.json().catch(() => ({}))) as ErrorBody;

	return { status: 'error', message: describeFailure(failure, response.status) };
}
