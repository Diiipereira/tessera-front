import { apiBaseUrl, type TeamSeatDto } from '@/lib/api-url';
import { failureFrom, unreachable, type ApiFailure, type ErrorBody } from '@/lib/api-errors';
import type { TeamRole } from '@/lib/types/management';

export type SeatWriteResult =
	{ status: 'saved'; seat: TeamSeatDto } | { status: 'error'; failure: ApiFailure };

export type SeatRemoveResult = { status: 'removed' } | { status: 'error'; failure: ApiFailure };

const seatUrl = (guildId: string, userId: string): string =>
	`${apiBaseUrl()}/guilds/${guildId}/team/${userId}`;

export async function putSeat(
	guildId: string,
	userId: string,
	role: TeamRole
): Promise<SeatWriteResult> {
	let response: Response;

	try {
		response = await fetch(seatUrl(guildId, userId), {
			method: 'PUT',
			credentials: 'include',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ role })
		});
	} catch (error) {
		return { status: 'error', failure: unreachable(error) };
	}

	if (response.ok) {
		return { status: 'saved', seat: (await response.json()) as TeamSeatDto };
	}

	const failure = (await response.json().catch(() => ({}))) as ErrorBody;

	return { status: 'error', failure: failureFrom(failure, response.status) };
}

export async function deleteSeat(guildId: string, userId: string): Promise<SeatRemoveResult> {
	let response: Response;

	try {
		response = await fetch(seatUrl(guildId, userId), {
			method: 'DELETE',
			credentials: 'include'
		});
	} catch (error) {
		return { status: 'error', failure: unreachable(error) };
	}

	if (response.ok) return { status: 'removed' };

	const failure = (await response.json().catch(() => ({}))) as ErrorBody;

	return { status: 'error', failure: failureFrom(failure, response.status) };
}
