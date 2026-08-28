import { apiBaseUrl, type InviteAcceptedDto, type InviteDto } from '@/lib/api-url';
import { describeFailure, type ErrorBody } from '@/lib/module-client';
import type { TeamRole } from '@/lib/types/management';

export type InviteMintResult =
	{ status: 'minted'; invite: InviteDto } | { status: 'error'; message: string };

export type InviteRevokeResult = { status: 'revoked' } | { status: 'error'; message: string };

export type InviteAcceptResult =
	{ status: 'accepted'; accepted: InviteAcceptedDto } | { status: 'error'; message: string };

const invitesUrl = (guildId: string): string => `${apiBaseUrl()}/guilds/${guildId}/invites`;

const unreachable = (error: unknown): string =>
	error instanceof Error ? error.message : 'The API could not be reached';

const explain = async (response: Response): Promise<string> => {
	const failure = (await response.json().catch(() => ({}))) as ErrorBody;

	return describeFailure(failure, response.status);
};

export async function mintInvite(guildId: string, role: TeamRole): Promise<InviteMintResult> {
	let response: Response;

	try {
		response = await fetch(invitesUrl(guildId), {
			method: 'POST',
			credentials: 'include',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ role })
		});
	} catch (error) {
		return { status: 'error', message: unreachable(error) };
	}

	if (response.ok) {
		return { status: 'minted', invite: (await response.json()) as InviteDto };
	}

	return { status: 'error', message: await explain(response) };
}

export async function revokeInvite(guildId: string, inviteId: string): Promise<InviteRevokeResult> {
	let response: Response;

	try {
		response = await fetch(`${invitesUrl(guildId)}/${inviteId}`, {
			method: 'DELETE',
			credentials: 'include'
		});
	} catch (error) {
		return { status: 'error', message: unreachable(error) };
	}

	if (response.ok) return { status: 'revoked' };

	return { status: 'error', message: await explain(response) };
}

export async function acceptInvite(token: string): Promise<InviteAcceptResult> {
	let response: Response;

	try {
		response = await fetch(`${apiBaseUrl()}/invites/${token}`, {
			method: 'POST',
			credentials: 'include'
		});
	} catch (error) {
		return { status: 'error', message: unreachable(error) };
	}

	if (response.ok) {
		return { status: 'accepted', accepted: (await response.json()) as InviteAcceptedDto };
	}

	return { status: 'error', message: await explain(response) };
}
