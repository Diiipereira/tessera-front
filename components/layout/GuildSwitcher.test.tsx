import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { Guild } from '@/lib/types/guild';
import { Translated } from '@/tests/i18n';
import { GuildSwitcher } from './GuildSwitcher';

const guild = (over: Partial<Guild> & { id: string; name: string; initials: string }): Guild => ({
	color: '#8b5cf6',
	iconUrl: null,
	memberCount: 196,
	hasBot: true,
	reachedBySeat: false,
	tier: 'free',
	missingPermissions: [],
	...over
});

const iconOf = (id: string) => `https://cdn.discordapp.com/icons/${id}/abc.png?size=128`;

const withIcon = guild({
	id: '1',
	name: 'Comunidade CJ GAMES',
	initials: 'CC',
	iconUrl: iconOf('1')
});

const withoutIcon = guild({ id: '2', name: 'Sem foto', initials: 'SF' });

function show(current: Guild, guilds: Guild[]) {
	render(
		<Translated>
			<GuildSwitcher guild={current} guilds={guilds} />
		</Translated>
	);

	return userEvent.setup();
}

const pictures = () => screen.queryAllByRole('presentation', { hidden: true });

describe('GuildSwitcher', () => {
	it('shows the picture of the server it is standing on', () => {
		show(withIcon, [withIcon]);

		expect(pictures()).toHaveLength(1);
		expect(screen.queryByText('CC')).not.toBeInTheDocument();
	});

	it('falls back to the initials of a server that has no picture', () => {
		show(withoutIcon, [withoutIcon]);

		expect(pictures()).toHaveLength(0);
		expect(screen.getByText('SF')).toBeInTheDocument();
	});

	it('shows the picture of every server the list offers', async () => {
		const user = show(withIcon, [withIcon, withoutIcon]);

		await user.click(screen.getAllByRole('button')[0] as HTMLElement);

		expect(await screen.findByText('Sem foto')).toBeInTheDocument();
		expect(pictures()).toHaveLength(2);
	});
});
