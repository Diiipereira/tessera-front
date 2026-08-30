import { cookies } from 'next/headers';
import { apiBaseUrl, SESSION_COOKIE } from './api-url';

export type ApiResult<T> =
	| { status: 'ok'; data: T }
	| { status: 'unauthenticated' }
	| {
			status: 'unreachable';
			answered: boolean;
			reason: string;
			code?: string;
			httpStatus?: number;
	  };

interface Failure {
	readonly reason: string;
	readonly code?: string;
}

async function failureReason(response: Response): Promise<Failure> {
	const status = `The API answered ${String(response.status)}`;

	try {
		const body = (await response.json()) as { error?: { code?: string; message?: string } };
		const { code, message } = body.error ?? {};

		if (code === undefined) return { reason: status };

		return { reason: `${status} (${code}): ${message ?? ''}`.trim(), code };
	} catch {
		return { reason: status };
	}
}

export async function apiGet<T>(path: string): Promise<ApiResult<T>> {
	const jar = await cookies();
	const session = jar.get(SESSION_COOKIE);

	if (session === undefined) return { status: 'unauthenticated' };

	let response: Response;

	try {
		response = await fetch(`${apiBaseUrl()}${path}`, {
			headers: { cookie: `${SESSION_COOKIE}=${session.value}` },
			cache: 'no-store'
		});
	} catch (error) {
		return {
			status: 'unreachable',
			answered: false,
			reason: error instanceof Error ? error.message : 'Unknown transport failure'
		};
	}

	if (response.status === 401) return { status: 'unauthenticated' };

	if (!response.ok) {
		return {
			status: 'unreachable',
			answered: true,
			...(await failureReason(response)),
			httpStatus: response.status
		};
	}

	return { status: 'ok', data: (await response.json()) as T };
}
