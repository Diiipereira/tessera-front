import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { INVITE_PERMISSIONS } from '@/lib/discord-invite';
import type { Guild } from '@/lib/types/guild';
import { GuildCard } from './GuildCard';

const GUILD_ID = '842315097461823104';

const guildOf = (overrides: Partial<Guild> = {}): Guild => ({
	id: GUILD_ID,
	name: 'Comunidade CJ GAMES',
	initials: 'CJ',
	color: '#5865f2',
	iconUrl: null,
	memberCount: 195,
	hasBot: true,
	tier: 'free',
	missingPermissions: [],
	...overrides
});

const hrefOf = (name: string): URL =>
	new URL(screen.getByRole('link', { name }).getAttribute('href') ?? '');

describe('GuildCard', () => {
	describe('a server that already has the bot', () => {
		it('offers the dashboard and a way to resend the permissions', () => {
			render(<GuildCard guild={guildOf()} />);

			expect(screen.getByRole('link', { name: 'Manage' })).toBeInTheDocument();
			expect(screen.getByRole('link', { name: 'Sync permissions' })).toBeInTheDocument();
			expect(screen.queryByRole('link', { name: 'Add to server' })).not.toBeInTheDocument();
		});

		it('sends the sync at Discord carrying the permissions we ask for today', () => {
			render(<GuildCard guild={guildOf()} />);

			const url = hrefOf('Sync permissions');

			expect(url.origin + url.pathname).toBe('https://discord.com/oauth2/authorize');
			expect(url.searchParams.get('permissions')).toBe(INVITE_PERMISSIONS);
		});

		it('locks the sync to this server, so no one re-authorises the wrong one', () => {
			render(<GuildCard guild={guildOf()} />);

			const url = hrefOf('Sync permissions');

			expect(url.searchParams.get('guild_id')).toBe(GUILD_ID);
			expect(url.searchParams.get('disable_guild_select')).toBe('true');
		});
	});

	describe('permissions the bot is missing', () => {
		it('stays quiet when the bot has everything we ask for', () => {
			render(<GuildCard guild={guildOf({ missingPermissions: [] })} />);

			expect(screen.queryByText(/permissions? behind/)).not.toBeInTheDocument();
		});

		it('says how many are missing, so you know which servers to sync', () => {
			render(
				<GuildCard guild={guildOf({ missingPermissions: ['BAN_MEMBERS', 'KICK_MEMBERS'] })} />
			);

			expect(screen.getByText('2 permissions behind')).toBeInTheDocument();
		});

		it('says permission in the singular when only one is missing', () => {
			render(<GuildCard guild={guildOf({ missingPermissions: ['BAN_MEMBERS'] })} />);

			expect(screen.getByText('1 permission behind')).toBeInTheDocument();
		});

		it('still offers the sync, because the warning is not a blocked action', () => {
			render(<GuildCard guild={guildOf({ missingPermissions: ['BAN_MEMBERS'] })} />);

			expect(screen.getByRole('link', { name: 'Sync permissions' })).toBeInTheDocument();
		});
	});

	describe('a server without the bot', () => {
		it('offers only the install, because there is nothing to manage or sync yet', () => {
			render(<GuildCard guild={guildOf({ hasBot: false })} />);

			expect(screen.getByRole('link', { name: 'Add to server' })).toBeInTheDocument();
			expect(screen.queryByRole('link', { name: 'Manage' })).not.toBeInTheDocument();
			expect(screen.queryByRole('link', { name: 'Sync permissions' })).not.toBeInTheDocument();
		});

		it('says the bot is not installed instead of a member count it does not have', () => {
			render(<GuildCard guild={guildOf({ hasBot: false })} />);

			expect(screen.getByText('Not installed yet')).toBeInTheDocument();
		});
	});
});
