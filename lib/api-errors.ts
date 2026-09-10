export const API_ERROR_CODES = [
	'ALREADY_LIFTED',
	'BAD_GATEWAY',
	'BAD_REQUEST',
	'CASE_ALREADY_REVOKED',
	'CASE_NOT_REVOCABLE',
	'CONFIG_CONFLICT',
	'CONFIG_INVALID',
	'CONFIG_UNKNOWN_FIELD',
	'CONFLICT',
	'DISCORD_REFUSED',
	'DISCORD_UNREACHABLE',
	'ECONOMY_DISABLED',
	'FORBIDDEN',
	'GIVEAWAYS_DISABLED',
	'GIVEAWAY_UNAVAILABLE',
	'HTTP_ERROR',
	'INTERNAL_ERROR',
	'INTERNAL_SERVER_ERROR',
	'INVALID_AUTOMOD_RULE',
	'INVALID_CREDENTIALS',
	'INVALID_GIVEAWAY',
	'INVALID_LEVEL_REWARD',
	'INVALID_LOG_ROUTE',
	'INVALID_PAYMENT',
	'INVALID_REACTION_PANEL',
	'INVALID_RULE',
	'INVALID_SCHEDULE',
	'INVALID_SHOP_ITEM',
	'INVALID_TICKET_PANEL',
	'INVALID_XP_CHANGE',
	'ITEM_UNAVAILABLE',
	'MODERATION_DISABLED',
	'MODULE_HAS_NO_TEST',
	'MUTED_ROLE_NOT_CONFIGURED',
	'NOT_FOUND',
	'OAUTH_FAILED',
	'PAYLOAD_TOO_LARGE',
	'REQUEST_TIMEOUT',
	'SCHEDULED_DISABLED',
	'SEAT_NOT_ASSIGNABLE',
	'SERVICE_UNAVAILABLE',
	'SETTINGS_INVALID',
	'THRESHOLD_TAKEN',
	'TICKETS_DISABLED',
	'TICKET_UNAVAILABLE',
	'TOO_MANY_ATTEMPTS',
	'TOO_MANY_REQUESTS',
	'UNAUTHENTICATED',
	'UNAUTHORIZED',
	'UNKNOWN_CASE_FILTER',
	'UNREACHABLE',
	'UNSUPPORTED_MEDIA_TYPE',
	'WEAK_PASSWORD'
] as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[number];

export type ApiFailure = {
	code: string;
	fallback: string;
	fields?: string[];
};

type ValidationIssue = { path?: string; message?: string };

export type ErrorBody = {
	error?: {
		code?: string;
		message?: string;
		details?: { issues?: ValidationIssue[] };
	};
};

export const isKnownCode = (code: string): code is ApiErrorCode =>
	API_ERROR_CODES.some((known) => known === code);

export function failureFrom(body: ErrorBody, status: number): ApiFailure {
	const issues = body.error?.details?.issues ?? [];
	const fields = issues
		.map((issue) => issue.path)
		.filter((path): path is string => path !== undefined);

	return {
		code: body.error?.code ?? `HTTP_${String(status)}`,
		fallback: body.error?.message ?? `The API answered ${String(status)}`,
		...(fields.length > 0 ? { fields } : {})
	};
}

export function unreachable(error: unknown): ApiFailure {
	return {
		code: 'UNREACHABLE',
		fallback: error instanceof Error ? error.message : 'The API could not be reached'
	};
}
