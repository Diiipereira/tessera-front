import { cookies } from 'next/headers';
import { apiBaseUrl, SESSION_COOKIE } from './api-url';

export type ApiResult<T> =
	| { status: 'ok'; data: T }
	| { status: 'unauthenticated' }
	| { status: 'unreachable'; reason: string };

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
			reason: error instanceof Error ? error.message : 'Unknown transport failure'
		};
	}

	if (response.status === 401) return { status: 'unauthenticated' };

	if (!response.ok) {
		return { status: 'unreachable', reason: `The API answered ${String(response.status)}` };
	}

	return { status: 'ok', data: (await response.json()) as T };
}
