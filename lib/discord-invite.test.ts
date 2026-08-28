import { describe, expect, it } from 'vitest';
import {
	INSTALL_RETURN_PATH,
	INVITE_PERMISSIONS,
	INVITE_SCOPES,
	REFUSED_PERMISSIONS,
	REQUESTED_PERMISSIONS,
	installReturnUri,
	inviteUrl
} from './discord-invite';
import { PERMISSION_NAMES, grants } from './discord-permissions';

const CLIENT_ID = '1542230629700079630';
const GUILD_ID = '842315097461823104';

describe('inviteUrl', () => {
	it('asks for the bot scopes plus the one that earns the trip back', () => {
		const url = new URL(inviteUrl(CLIENT_ID) ?? '');

		expect(url.searchParams.get('scope')).toBe('bot applications.commands identify');
		expect(INVITE_SCOPES).toEqual(['bot', 'applications.commands', 'identify']);
	});

	it('asks Discord to return the installer to us instead of stranding them', () => {
		const url = new URL(inviteUrl(CLIENT_ID) ?? '');

		expect(url.searchParams.get('response_type')).toBe('code');
		expect(url.searchParams.get('redirect_uri')).toBe(installReturnUri());
	});

	it('points the return at the API, which is what the portal must have registered', () => {
		expect(installReturnUri()).toBe(`http://localhost:3001${INSTALL_RETURN_PATH}`);
	});

	it('carries the client id and the permission integer', () => {
		const url = new URL(inviteUrl(CLIENT_ID) ?? '');

		expect(url.searchParams.get('client_id')).toBe(CLIENT_ID);
		expect(url.searchParams.get('permissions')).toBe(INVITE_PERMISSIONS);
	});

	it('points at the Discord authorize endpoint', () => {
		const url = new URL(inviteUrl(CLIENT_ID) ?? '');

		expect(url.origin + url.pathname).toBe('https://discord.com/oauth2/authorize');
	});

	it('leaves the server choice open when no guild is named', () => {
		const url = new URL(inviteUrl(CLIENT_ID) ?? '');

		expect(url.searchParams.get('guild_id')).toBeNull();
		expect(url.searchParams.get('disable_guild_select')).toBeNull();
	});

	it('pre-selects and locks the server when one is named', () => {
		const url = new URL(inviteUrl(CLIENT_ID, GUILD_ID) ?? '');

		expect(url.searchParams.get('guild_id')).toBe(GUILD_ID);
		expect(url.searchParams.get('disable_guild_select')).toBe('true');
	});

	it('answers null rather than a broken URL when the client id is missing', () => {
		expect(inviteUrl('')).toBeNull();
		expect(inviteUrl('', GUILD_ID)).toBeNull();
	});

	it('resolves to one exact integer, whichever order the table is written in', () => {
		expect(INVITE_PERMISSIONS).toBe('8866461766385655');
	});

	it('never asks for Administrator, which hierarchy would not honour anyway', () => {
		expect(REFUSED_PERMISSIONS).toEqual(['ADMINISTRATOR']);
		expect(grants(BigInt(INVITE_PERMISSIONS), 'ADMINISTRATOR')).toBe(false);
	});

	it('asks for every other permission Discord defines', () => {
		const missing = PERMISSION_NAMES.filter(
			(name) => !REFUSED_PERMISSIONS.includes(name) && !grants(BigInt(INVITE_PERMISSIONS), name)
		);

		expect(missing).toEqual([]);
		expect(REQUESTED_PERMISSIONS).toHaveLength(PERMISSION_NAMES.length - 1);
		expect(REQUESTED_PERMISSIONS).toHaveLength(51);
	});
});
