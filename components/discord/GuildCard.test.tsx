import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { INVITE_PERMISSIONS } from '@/lib/discord-invite';
import type { Guild } from '@/lib/types/guild';
import messages from '@/messages/en-US.json';
import { Translated } from '@/tests/i18n';
import { GuildCard } from './GuildCard';

const copy = messages.servers.card;

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

function renderCard(guild: Guild) {
	render(
		<Translated>
			<GuildCard guild={guild} />
		</Translated>
	);
}

describe('GuildCard', () => {
	describe('a server that already has the bot', () => {
		it('offers the dashboard and a way to resend the permissions', () => {
			renderCard(guildOf());

			expect(screen.getByRole('link', { name: copy.manage })).toBeInTheDocument();
			expect(screen.getByRole('link', { name: copy.sync })).toBeInTheDocument();
			expect(screen.queryByRole('link', { name: copy.add })).not.toBeInTheDocument();
		});

		it('sends the sync at Discord carrying the permissions we ask for today', () => {
			renderCard(guildOf());

			const url = hrefOf(copy.sync);

			expect(url.origin + url.pathname).toBe('https://discord.com/oauth2/authorize');
			expect(url.searchParams.get('permissions')).toBe(INVITE_PERMISSIONS);
		});

		it('locks the sync to this server, so no one re-authorises the wrong one', () => {
			renderCard(guildOf());

			const url = hrefOf(copy.sync);

			expect(url.searchParams.get('guild_id')).toBe(GUILD_ID);
			expect(url.searchParams.get('disable_guild_select')).toBe('true');
		});
	});

	describe('permissions the bot is missing', () => {
		it('stays quiet when the bot has everything we ask for', () => {
			renderCard(guildOf({ missingPermissions: [] }));

			expect(screen.queryByText(/permissions? behind/)).not.toBeInTheDocument();
		});

		it('says how many are missing, so you know which servers to sync', () => {
			renderCard(guildOf({ missingPermissions: ['BAN_MEMBERS', 'KICK_MEMBERS'] }));

			expect(screen.getByText('2 permissions behind')).toBeInTheDocument();
		});

		it('says permission in the singular when only one is missing', () => {
			renderCard(guildOf({ missingPermissions: ['BAN_MEMBERS'] }));

			expect(screen.getByText('1 permission behind')).toBeInTheDocument();
		});

		it('still offers the sync, because the warning is not a blocked action', () => {
			renderCard(guildOf({ missingPermissions: ['BAN_MEMBERS'] }));

			expect(screen.getByRole('link', { name: copy.sync })).toBeInTheDocument();
		});
	});

	describe('a server without the bot', () => {
		it('offers only the install, because there is nothing to manage or sync yet', () => {
			renderCard(guildOf({ hasBot: false }));

			expect(screen.getByRole('link', { name: copy.add })).toBeInTheDocument();
			expect(screen.queryByRole('link', { name: copy.manage })).not.toBeInTheDocument();
			expect(screen.queryByRole('link', { name: copy.sync })).not.toBeInTheDocument();
		});

		it('says the bot is not installed instead of a member count it does not have', () => {
			renderCard(guildOf({ hasBot: false }));

			expect(screen.getByText(copy.absent)).toBeInTheDocument();
			expect(screen.queryByText(/members/)).not.toBeInTheDocument();
		});
	});

	describe('the member count', () => {
		it('groups thousands the way the reader locale does, not the way en-US does', () => {
			render(
				<Translated locale="pt-BR">
					<GuildCard guild={guildOf({ memberCount: 12431 })} />
				</Translated>
			);

			expect(screen.getByText('12.431 membros')).toBeInTheDocument();
		});
	});
});
