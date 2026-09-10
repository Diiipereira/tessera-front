import { apiBaseUrl } from '@/lib/api-url';
import { failureFrom, unreachable, type ApiFailure, type ErrorBody } from '@/lib/api-errors';

export type SessionRevokeResult = { status: 'revoked' } | { status: 'error'; failure: ApiFailure };

const sessionsUrl = (): string => `${apiBaseUrl()}/auth/sessions`;

async function remove(url: string): Promise<SessionRevokeResult> {
	let response: Response;

	try {
		response = await fetch(url, { method: 'DELETE', credentials: 'include' });
	} catch (error) {
		return {
			status: 'error',
			failure: unreachable(error)
		};
	}

	if (response.ok) return { status: 'revoked' };

	const failure = (await response.json().catch(() => ({}))) as ErrorBody;

	return { status: 'error', failure: failureFrom(failure, response.status) };
}

export const revokeSession = (sessionId: string): Promise<SessionRevokeResult> =>
	remove(`${sessionsUrl()}/${sessionId}`);

export const revokeOtherSessions = (): Promise<SessionRevokeResult> =>
	remove(`${sessionsUrl()}/others`);
