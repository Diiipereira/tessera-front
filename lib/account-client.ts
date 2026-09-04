import { apiBaseUrl } from '@/lib/api-url';
import { describeFailure, type ErrorBody } from '@/lib/module-client';

export type SessionRevokeResult = { status: 'revoked' } | { status: 'error'; message: string };

const sessionsUrl = (): string => `${apiBaseUrl()}/auth/sessions`;

async function remove(url: string): Promise<SessionRevokeResult> {
	let response: Response;

	try {
		response = await fetch(url, { method: 'DELETE', credentials: 'include' });
	} catch (error) {
		return {
			status: 'error',
			message: error instanceof Error ? error.message : 'The API could not be reached'
		};
	}

	if (response.ok) return { status: 'revoked' };

	const failure = (await response.json().catch(() => ({}))) as ErrorBody;

	return { status: 'error', message: describeFailure(failure, response.status) };
}

export const revokeSession = (sessionId: string): Promise<SessionRevokeResult> =>
	remove(`${sessionsUrl()}/${sessionId}`);

export const revokeOtherSessions = (): Promise<SessionRevokeResult> =>
	remove(`${sessionsUrl()}/others`);
