import { apiBaseUrl } from '@/lib/api-url';
import { describeFailure, type ErrorBody } from '@/lib/module-client';
import {
	toMember,
	toMembers,
	toSearchParams,
	type MemberDetailDto,
	type MemberListDto,
	type MemberQuery
} from '@/lib/members';
import type { Member, MemberDetail } from '@/lib/types/management';

export type MemberPage = { members: Member[]; total: number; searched: boolean };

export type MemberLoadResult =
	{ status: 'loaded'; page: MemberPage } | { status: 'error'; message: string };

export type MemberDetailResult =
	{ status: 'loaded'; detail: MemberDetail } | { status: 'error'; message: string };

const membersUrl = (guildId: string): string => `${apiBaseUrl()}/guilds/${guildId}/members`;

type Answer<T> = { ok: true; data: T } | { ok: false; message: string };

async function read<T>(url: string): Promise<Answer<T>> {
	let response: Response;

	try {
		response = await fetch(url, { credentials: 'include', cache: 'no-store' });
	} catch (error) {
		return {
			ok: false,
			message: error instanceof Error ? error.message : 'The API could not be reached'
		};
	}

	if (response.ok) return { ok: true, data: (await response.json()) as T };

	const failure = (await response.json().catch(() => ({}))) as ErrorBody;

	return { ok: false, message: describeFailure(failure, response.status) };
}

export async function loadMembers(guildId: string, query: MemberQuery): Promise<MemberLoadResult> {
	const result = await read<MemberListDto>(
		`${membersUrl(guildId)}?${toSearchParams(query).toString()}`
	);

	if (!result.ok) return { status: 'error', message: result.message };

	return {
		status: 'loaded',
		page: {
			members: toMembers(result.data.members),
			total: result.data.total,
			searched: result.data.searched
		}
	};
}

export async function loadMember(guildId: string, userId: string): Promise<MemberDetailResult> {
	const result = await read<MemberDetailDto>(`${membersUrl(guildId)}/${userId}`);

	if (!result.ok) return { status: 'error', message: result.message };

	return {
		status: 'loaded',
		detail: {
			member: toMember(result.data.member),
			present: result.data.present,
			nickname: result.data.nickname,
			bot: result.data.bot,
			roleIds: result.data.roleIds,
			joinedAt: result.data.joinedAt,
			timedOutUntil: result.data.timedOutUntil
		}
	};
}
