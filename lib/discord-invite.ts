import { apiBaseUrl } from '@/lib/api-url';
import { permissionMask, permissionsExcept, type PermissionName } from '@/lib/discord-permissions';

const AUTHORIZE_URL = 'https://discord.com/oauth2/authorize';

export type ExternalHref = `${typeof AUTHORIZE_URL}?${string}`;

export const INVITE_SCOPES = ['bot', 'applications.commands', 'identify'] as const;

export const REFUSED_PERMISSIONS: readonly PermissionName[] = ['ADMINISTRATOR'];

export const REQUESTED_PERMISSIONS = permissionsExcept(REFUSED_PERMISSIONS);

export const INVITE_PERMISSIONS = permissionMask(REQUESTED_PERMISSIONS).toString();

export const INSTALL_RETURN_PATH = '/auth/discord/install';

export function installReturnUri(): string {
	return `${apiBaseUrl()}${INSTALL_RETURN_PATH}`;
}

export function inviteUrl(clientId: string, guildId?: string): ExternalHref | null {
	if (clientId === '') return null;

	const query = new URLSearchParams({
		client_id: clientId,
		scope: INVITE_SCOPES.join(' '),
		permissions: INVITE_PERMISSIONS,
		response_type: 'code',
		redirect_uri: installReturnUri()
	});

	if (guildId !== undefined && guildId !== '') {
		query.set('guild_id', guildId);
		query.set('disable_guild_select', 'true');
	}

	return `${AUTHORIZE_URL}?${query.toString()}`;
}

export function discordClientId(): string {
	return process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ?? '';
}

export function botInviteUrl(guildId?: string): ExternalHref | null {
	return inviteUrl(discordClientId(), guildId);
}

export const INVITE_HREF: ExternalHref | '/docs' = botInviteUrl() ?? '/docs';
