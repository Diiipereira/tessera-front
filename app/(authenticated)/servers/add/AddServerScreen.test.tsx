import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BRAND } from '@/lib/brand';
import { botInviteUrl } from '@/lib/discord-invite';
import type { Guild } from '@/lib/types/guild';
import enUS from '@/messages/en-US.json';
import { Translated } from '@/tests/i18n';
import { AddServerScreen } from './AddServerScreen';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

const GUILD_ID = '842315097461823104';

const DANGLING = /\b(in|to|em|para|a)\s*[….]?\s*$/i;

const guild: Guild = {
	id: GUILD_ID,
	name: 'Comunidade CJ GAMES',
	initials: 'CJ',
	color: '#5865f2',
	iconUrl: null,
	memberCount: 195,
	hasBot: false,
	tier: 'free',
	missingPermissions: []
};

const filled = (message: string, values: Record<string, string>): string =>
	Object.entries(values).reduce(
		(text, [key, value]) => text.replaceAll(`{${key}}`, value),
		message
	);

function renderAdd(target: Guild | null, joined: boolean) {
	render(
		<Translated>
			<AddServerScreen guild={target} joined={joined} inviteHref={botInviteUrl(target?.id)} />
		</Translated>
	);
}

describe('AddServerScreen', () => {
	it('names the server it is waiting on', () => {
		renderAdd(guild, false);

		const expected = filled(enUS.servers.add.waiting, { brand: BRAND.name, guild: guild.name });

		expect(screen.getByRole('heading', { name: expected })).toBeInTheDocument();
	});

	it('finishes the sentence even when Discord did not say which server', () => {
		renderAdd(null, true);

		const heading = screen.getByRole('heading').textContent;

		expect(heading).toContain(BRAND.name);
		expect(heading).not.toMatch(DANGLING);
	});

	it('finishes the waiting sentence too, with no server to name', () => {
		renderAdd(null, false);

		const heading = screen.getByRole('heading').textContent;

		expect(heading).toContain(BRAND.name);
		expect(heading).not.toMatch(DANGLING);
	});

	it('says where the bot landed once it has joined', () => {
		renderAdd(guild, true);

		const expected = filled(enUS.servers.add.joined, { brand: BRAND.name, guild: guild.name });

		expect(screen.getByRole('heading', { name: expected })).toBeInTheDocument();
		expect(screen.getByText(enUS.servers.add.toSetup)).toBeInTheDocument();
	});

	it('points the invite at the server the visitor picked', () => {
		renderAdd(guild, false);

		const label = filled(enUS.servers.add.inviteTo, { guild: guild.name });
		const href = screen.getByRole('link', { name: label }).getAttribute('href') ?? '';

		expect(new URL(href).searchParams.get('guild_id')).toBe(GUILD_ID);
	});

	it('still offers a generic invite when no server was named', () => {
		renderAdd(null, false);

		expect(screen.getByRole('link', { name: enUS.servers.add.invite })).toBeInTheDocument();
	});
});
