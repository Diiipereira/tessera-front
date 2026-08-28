import { apiBaseUrl, type TeamSeatDto } from '@/lib/api-url';
import { describeFailure, type ErrorBody } from '@/lib/module-client';
import type { TeamRole } from '@/lib/types/management';

export type SeatWriteResult =
	{ status: 'saved'; seat: TeamSeatDto } | { status: 'error'; message: string };

export type SeatRemoveResult = { status: 'removed' } | { status: 'error'; message: string };

const seatUrl = (guildId: string, userId: string): string =>
	`${apiBaseUrl()}/guilds/${guildId}/team/${userId}`;

const unreachable = (error: unknown): string =>
	error instanceof Error ? error.message : 'The API could not be reached';

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
		return { status: 'error', message: unreachable(error) };
	}

	if (response.ok) {
		return { status: 'saved', seat: (await response.json()) as TeamSeatDto };
	}

	const failure = (await response.json().catch(() => ({}))) as ErrorBody;

	return { status: 'error', message: describeFailure(failure, response.status) };
}

export async function deleteSeat(guildId: string, userId: string): Promise<SeatRemoveResult> {
	let response: Response;

	try {
		response = await fetch(seatUrl(guildId, userId), {
			method: 'DELETE',
			credentials: 'include'
		});
	} catch (error) {
		return { status: 'error', message: unreachable(error) };
	}

	if (response.ok) return { status: 'removed' };

	const failure = (await response.json().catch(() => ({}))) as ErrorBody;

	return { status: 'error', message: describeFailure(failure, response.status) };
}
