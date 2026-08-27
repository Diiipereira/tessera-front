export type LoginError = {
	title: string;
	body: string;
};

export type CallbackFailure = {
	code: string;
	reason: string;
	reference: string;
};

const LOGIN_ERRORS: Record<string, LoginError> = {
	access_denied: {
		title: 'You declined the Discord prompt',
		body: 'Nothing was shared. Authorize the app to continue, or close this tab.'
	},
	session_expired: {
		title: 'Your session expired',
		body: 'You were away for a while, so we ended the sign-in for safety. Start again.'
	},
	unknown: {
		title: 'Something went wrong on our side',
		body: "Discord is reachable, but we couldn't finish. Trying again usually works."
	}
};

const CALLBACK_FAILURES: Record<string, Omit<CallbackFailure, 'reference'>> = {
	invalid_grant: {
		code: 'invalid_grant',
		reason: 'the authorization code had already been used. Starting again fixes it.'
	},
	invalid_state: {
		code: 'invalid_state',
		reason: 'the request did not match the one we started. Starting again fixes it.'
	},
	unknown: {
		code: 'server_error',
		reason: 'Discord could not complete the exchange. Trying again usually works.'
	}
};

export function loginErrorFor(kind: string | null): LoginError | null {
	if (kind === null) return null;
	return LOGIN_ERRORS[kind] ?? LOGIN_ERRORS.unknown ?? null;
}

export function callbackFailureFor(kind: string | null, reference: string): CallbackFailure | null {
	if (kind === null) return null;
	const failure = CALLBACK_FAILURES[kind] ?? CALLBACK_FAILURES.unknown;
	if (!failure) return null;
	return { ...failure, reference };
}
