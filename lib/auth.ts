export const LOGIN_ERROR_KINDS = ['access_denied', 'session_expired', 'unknown'] as const;

export type LoginErrorKind = (typeof LOGIN_ERROR_KINDS)[number];

const CALLBACK_CODES = {
	invalid_grant: 'invalid_grant',
	invalid_state: 'invalid_state',
	unknown: 'server_error'
} as const;

export type CallbackFailureKind = keyof typeof CALLBACK_CODES;

export type CallbackFailure = {
	kind: CallbackFailureKind;
	code: string;
	reference: string;
};

function isLoginErrorKind(value: string): value is LoginErrorKind {
	return LOGIN_ERROR_KINDS.some((kind) => kind === value);
}

function isCallbackFailureKind(value: string): value is CallbackFailureKind {
	return Object.hasOwn(CALLBACK_CODES, value);
}

export function loginErrorFor(kind: string | null): LoginErrorKind | null {
	if (kind === null) return null;
	return isLoginErrorKind(kind) ? kind : 'unknown';
}

export function callbackFailureFor(kind: string | null, reference: string): CallbackFailure | null {
	if (kind === null) return null;
	const resolved: CallbackFailureKind = isCallbackFailureKind(kind) ? kind : 'unknown';
	return { kind: resolved, code: CALLBACK_CODES[resolved], reference };
}
