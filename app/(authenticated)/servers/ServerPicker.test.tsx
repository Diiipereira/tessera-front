import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { BRAND } from '@/lib/brand';
import type { SupportedLocale } from '@/lib/locale';
import type { Guild } from '@/lib/types/guild';
import enUS from '@/messages/en-US.json';
import ptBR from '@/messages/pt-BR.json';
import { Translated } from '@/tests/i18n';
import { ServerPicker } from './ServerPicker';

const withBrand = (message: string): string => message.replaceAll('{brand}', BRAND.name);

const guildOf = (id: string, name: string, hasBot: boolean): Guild => ({
	id,
	name,
	initials: name.slice(0, 2).toUpperCase(),
	color: '#5865f2',
	iconUrl: null,
	memberCount: 195,
	hasBot,
	reachedBySeat: false,
	tier: 'free',
	missingPermissions: []
});

const guilds = [
	guildOf('842315097461823101', 'Tessera Dev', true),
	guildOf('842315097461823102', 'Comunidade CJ GAMES', false)
];

function renderPicker(list: Guild[], locale: SupportedLocale = 'en-US') {
	render(
		<Translated locale={locale}>
			<ServerPicker guilds={list} loading={false} empty={list.length === 0} />
		</Translated>
	);
}

describe('ServerPicker', () => {
	it('separates the servers that have the bot from the ones that do not', () => {
		renderPicker(guilds);

		expect(screen.getByText(withBrand(enUS.servers.managedBy))).toBeInTheDocument();
		expect(screen.getByText(withBrand(enUS.servers.addBrand))).toBeInTheDocument();
	});

	it('hides the servers without the bot when the managed filter is picked', async () => {
		const user = userEvent.setup();
		renderPicker(guilds);

		await user.click(screen.getByRole('button', { name: withBrand(enUS.servers.filters.managed) }));

		expect(screen.getByText('Tessera Dev')).toBeInTheDocument();
		expect(screen.queryByText('Comunidade CJ GAMES')).not.toBeInTheDocument();
	});

	it('narrows the list to what the search matches', async () => {
		const user = userEvent.setup();
		renderPicker(guilds);

		await user.type(screen.getByRole('searchbox', { name: enUS.servers.searchLabel }), 'CJ');

		expect(screen.getByText('Comunidade CJ GAMES')).toBeInTheDocument();
		expect(screen.queryByText('Tessera Dev')).not.toBeInTheDocument();
	});

	it('explains what is missing when there is nothing to show', () => {
		renderPicker([]);

		expect(screen.getByText(enUS.servers.emptyTitle)).toBeInTheDocument();
		expect(screen.getByText(withBrand(enUS.servers.emptyBody))).toBeInTheDocument();
	});

	it('names the brand inside the translated filter, not beside it', () => {
		renderPicker(guilds, 'pt-BR');

		expect(
			screen.getByRole('button', { name: withBrand(ptBR.servers.filters.managed) })
		).toBeInTheDocument();
		expect(screen.getByRole('heading', { name: ptBR.servers.title })).toBeInTheDocument();
	});
});
