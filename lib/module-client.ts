import { apiBaseUrl, type GuildModuleStateDto } from '@/lib/api-url';
import { failureFrom, unreachable, type ApiFailure, type ErrorBody } from '@/lib/api-errors';

export type ModuleWriteResult =
	| { status: 'saved'; state: GuildModuleStateDto }
	| { status: 'conflict'; state: GuildModuleStateDto }
	| { status: 'error'; failure: ApiFailure };

export type ModulePatchBody = {
	version: number;
	enabled?: boolean;
	config?: Record<string, unknown>;
};

const moduleUrl = (guildId: string, moduleKey: string): string =>
	`${apiBaseUrl()}/guilds/${guildId}/modules/${moduleKey}`;

export async function readModule(
	guildId: string,
	moduleKey: string
): Promise<GuildModuleStateDto | null> {
	const response = await fetch(moduleUrl(guildId, moduleKey), {
		credentials: 'include',
		cache: 'no-store'
	});

	if (!response.ok) return null;

	return (await response.json()) as GuildModuleStateDto;
}

export async function patchModule(
	guildId: string,
	moduleKey: string,
	body: ModulePatchBody
): Promise<ModuleWriteResult> {
	let response: Response;

	try {
		response = await fetch(moduleUrl(guildId, moduleKey), {
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
		return { status: 'saved', state: (await response.json()) as GuildModuleStateDto };
	}

	const failure = (await response.json().catch(() => ({}))) as ErrorBody;

	if (response.status === 409) {
		const current = await readModule(guildId, moduleKey);

		if (current === null) {
			return { status: 'error', failure: failureFrom(failure, response.status) };
		}

		return { status: 'conflict', state: current };
	}

	return { status: 'error', failure: failureFrom(failure, response.status) };
}

export type ModuleTestOutcome = 'sent' | 'not-ready' | 'channel-refused';

export type ModuleTestResult =
	{ status: 'ok'; outcome: ModuleTestOutcome } | { status: 'error'; failure: ApiFailure };

export async function sendModuleTest(
	guildId: string,
	moduleKey: string
): Promise<ModuleTestResult> {
	let response: Response;

	try {
		response = await fetch(`${moduleUrl(guildId, moduleKey)}/test`, {
			method: 'POST',
			credentials: 'include'
		});
	} catch (error) {
		return {
			status: 'error',
			failure: unreachable(error)
		};
	}

	if (!response.ok) {
		const failure = (await response.json().catch(() => ({}))) as ErrorBody;

		return { status: 'error', failure: failureFrom(failure, response.status) };
	}

	const body = (await response.json()) as { outcome: ModuleTestOutcome };

	return { status: 'ok', outcome: body.outcome };
}
