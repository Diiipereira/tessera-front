import { apiBaseUrl } from '@/lib/api-url';
import { failureFrom, unreachable, type ApiFailure, type ErrorBody } from '@/lib/api-errors';
import type {
	CasePage,
	CaseStatusFilter,
	InfractionType,
	ModerationCase,
	RevokedCase
} from '@/lib/types/management';

export type CaseQuery = {
	type?: InfractionType;
	status?: CaseStatusFilter;
	targetId?: string;
	cursor?: string;
	limit?: number;
};

export type CaseListResult =
	{ status: 'ok'; page: CasePage } | { status: 'error'; failure: ApiFailure };

export type CaseReadResult =
	{ status: 'ok'; entry: ModerationCase } | { status: 'error'; failure: ApiFailure };

export function casesUrl(guildId: string, query: CaseQuery): string {
	const search = new URLSearchParams();

	if (query.type !== undefined) search.set('type', query.type);
	if (query.status !== undefined) search.set('status', query.status);
	if (query.targetId !== undefined) search.set('targetId', query.targetId);
	if (query.cursor !== undefined) search.set('cursor', query.cursor);
	if (query.limit !== undefined) search.set('limit', String(query.limit));

	const suffix = search.size === 0 ? '' : `?${search.toString()}`;

	return `${apiBaseUrl()}/guilds/${guildId}/cases${suffix}`;
}

export async function listCases(guildId: string, query: CaseQuery): Promise<CaseListResult> {
	let response: Response;

	try {
		response = await fetch(casesUrl(guildId, query), { credentials: 'include' });
	} catch (error) {
		return { status: 'error', failure: unreachable(error) };
	}

	if (response.ok) {
		return { status: 'ok', page: (await response.json()) as CasePage };
	}

	const failure = (await response.json().catch(() => ({}))) as ErrorBody;

	return { status: 'error', failure: failureFrom(failure, response.status) };
}

export async function readCase(guildId: string, number: number): Promise<CaseReadResult> {
	let response: Response;

	try {
		response = await fetch(`${apiBaseUrl()}/guilds/${guildId}/cases/${String(number)}`, {
			credentials: 'include'
		});
	} catch (error) {
		return { status: 'error', failure: unreachable(error) };
	}

	if (response.ok) {
		return { status: 'ok', entry: (await response.json()) as ModerationCase };
	}

	const failure = (await response.json().catch(() => ({}))) as ErrorBody;

	return { status: 'error', failure: failureFrom(failure, response.status) };
}

export type CaseRevokeResult =
	{ status: 'ok'; revoked: RevokedCase } | { status: 'error'; failure: ApiFailure };

export async function revokeCase(
	guildId: string,
	number: number,
	reason: string | null
): Promise<CaseRevokeResult> {
	let response: Response;

	try {
		response = await fetch(`${apiBaseUrl()}/guilds/${guildId}/cases/${String(number)}/revoke`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(reason === null ? {} : { reason })
		});
	} catch (error) {
		return { status: 'error', failure: unreachable(error) };
	}

	if (response.ok) {
		return { status: 'ok', revoked: (await response.json()) as RevokedCase };
	}

	const failure = (await response.json().catch(() => ({}))) as ErrorBody;

	return { status: 'error', failure: failureFrom(failure, response.status) };
}
