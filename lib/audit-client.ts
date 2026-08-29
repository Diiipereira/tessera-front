import { apiBaseUrl } from '@/lib/api-url';
import { describeFailure, type ErrorBody } from '@/lib/module-client';
import type { AuditPage, AuditSource } from '@/lib/types/management';

export type AuditQuery = {
	moduleKey?: string;
	source?: AuditSource;
	cursor?: string;
	limit?: number;
};

export type AuditReadResult =
	{ status: 'ok'; page: AuditPage } | { status: 'error'; message: string };

export function auditUrl(guildId: string, query: AuditQuery): string {
	const search = new URLSearchParams();

	if (query.moduleKey !== undefined) search.set('moduleKey', query.moduleKey);
	if (query.source !== undefined) search.set('source', query.source);
	if (query.cursor !== undefined) search.set('cursor', query.cursor);
	if (query.limit !== undefined) search.set('limit', String(query.limit));

	const suffix = search.size === 0 ? '' : `?${search.toString()}`;

	return `${apiBaseUrl()}/guilds/${guildId}/audit${suffix}`;
}

const unreachable = (error: unknown): string =>
	error instanceof Error ? error.message : 'The API could not be reached';

export async function readAudit(guildId: string, query: AuditQuery): Promise<AuditReadResult> {
	let response: Response;

	try {
		response = await fetch(auditUrl(guildId, query), { credentials: 'include' });
	} catch (error) {
		return { status: 'error', message: unreachable(error) };
	}

	if (response.ok) {
		return { status: 'ok', page: (await response.json()) as AuditPage };
	}

	const failure = (await response.json().catch(() => ({}))) as ErrorBody;

	return { status: 'error', message: describeFailure(failure, response.status) };
}
