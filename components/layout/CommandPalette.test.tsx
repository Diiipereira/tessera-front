import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { mockGuilds } from '@/lib/mock';
import enUS from '@/messages/en-US.json';
import { Translated } from '@/tests/i18n';
import { CommandPalette } from './CommandPalette';

vi.mock('next/navigation', () => ({
	useRouter: () => ({ push: () => undefined })
}));

const [guild, other] = mockGuilds as [(typeof mockGuilds)[number], (typeof mockGuilds)[number]];

function open() {
	return render(
		<CommandPalette open onOpenChange={() => undefined} guild={guild} guilds={mockGuilds} />,
		{ wrapper: Translated }
	);
}

const results = () => screen.getByRole('listbox');

describe('CommandPalette', () => {
	it('names every destination in the language the app is showing', () => {
		open();

		expect(within(results()).getByRole('option', { name: enUS.nav.welcome })).toBeInTheDocument();
		expect(within(results()).getByRole('option', { name: enUS.nav.overview })).toBeInTheDocument();
	});

	it('prints no URL, because the URL is English and the interface may not be', () => {
		open();

		const printed = within(results())
			.getAllByRole('option')
			.map((option) => option.textContent);

		expect(printed.filter((text) => text.includes('/modules'))).toEqual([]);
		expect(printed.filter((text) => text.includes('/servers'))).toEqual([]);
	});

	it('still says what picking another server does, because that is not a path', () => {
		open();

		expect(within(results()).getAllByText(enUS.palette.switchServer).length).toBeGreaterThan(0);
		expect(other.name).not.toBe(guild.name);
	});
});
