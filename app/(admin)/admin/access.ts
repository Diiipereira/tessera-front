import { redirect } from 'next/navigation';
import { apiGet } from '@/lib/api';

export const START_COMMAND = 'npm run dev:api';

export type AdminRead<T> =
	| { status: 'ok'; data: T }
	| { status: 'missing'; reason: string }
	| { status: 'unreachable'; reason: string };

export async function readAsStaff<T>(path: string): Promise<AdminRead<T>> {
	const result = await apiGet<T>(path);

	if (result.status === 'unauthenticated') {
		redirect('/login');
	}

	if (result.status === 'unreachable') {
		if (result.httpStatus === 403) {
			redirect('/servers');
		}

		if (result.httpStatus === 404) {
			return { status: 'missing', reason: result.reason };
		}

		return { status: 'unreachable', reason: result.reason };
	}

	return { status: 'ok', data: result.data };
}
