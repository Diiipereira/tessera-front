import { apiBaseUrl, type GuildModuleStateDto } from '@/lib/api-url';

export type ModuleWriteResult =
	| { status: 'saved'; state: GuildModuleStateDto }
	| { status: 'conflict'; state: GuildModuleStateDto }
	| { status: 'error'; message: string };

export type ModulePatchBody = {
	version: number;
	enabled?: boolean;
	config?: Record<string, unknown>;
};

type ValidationIssue = { path?: string; message?: string };

export type ErrorBody = {
	error?: {
		code?: string;
		message?: string;
		details?: { issues?: ValidationIssue[] };
	};
};

export function describeFailure(body: ErrorBody, status: number): string {
	const issues = body.error?.details?.issues ?? [];

	if (issues.length > 0) {
		return issues
			.map((issue) => `${issue.path ?? 'config'}: ${issue.message ?? 'is not valid'}`)
			.join('; ');
	}

	return body.error?.message ?? `The API answered ${String(status)}`;
}

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
			message: error instanceof Error ? error.message : 'The API could not be reached'
		};
	}

	if (response.ok) {
		return { status: 'saved', state: (await response.json()) as GuildModuleStateDto };
	}

	const failure = (await response.json().catch(() => ({}))) as ErrorBody;

	if (response.status === 409) {
		const current = await readModule(guildId, moduleKey);

		if (current === null) {
			return { status: 'error', message: describeFailure(failure, response.status) };
		}

		return { status: 'conflict', state: current };
	}

	return { status: 'error', message: describeFailure(failure, response.status) };
}
