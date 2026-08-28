import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mockModules } from '@/lib/mock';
import { guildHref } from '@/lib/navigation';
import { ModulesScreen } from './ModulesScreen';
import { Translated } from '@/tests/i18n';

const GUILD_ID = '842315097461823104';

function renderScreen(planIsPaid = true) {
	return render(
		<ModulesScreen modules={mockModules} guildId={GUILD_ID} planIsPaid={planIsPaid} />,
		{
			wrapper: Translated
		}
	);
}

function cardFor(name: string) {
	return screen.getByRole('heading', { name, level: 2 }).closest('div.group') as HTMLElement;
}

describe('ModulesScreen', () => {
	it('shows every module', () => {
		renderScreen();
		expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(mockModules.length);
	});

	it('links each card at its own settings route', () => {
		renderScreen();
		expect(within(cardFor('Welcome')).getByRole('link', { name: /Configure/ })).toHaveAttribute(
			'href',
			guildHref(GUILD_ID, '/modules/welcome')
		);
		expect(
			within(cardFor('Reaction roles')).getByRole('link', { name: /Configure/ })
		).toHaveAttribute('href', guildHref(GUILD_ID, '/modules/reaction-roles'));
	});

	it('narrows by search', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.type(screen.getByLabelText('Search modules'), 'ticket');

		expect(screen.getByRole('heading', { name: 'Tickets', level: 2 })).toBeInTheDocument();
		expect(screen.queryByRole('heading', { name: 'Welcome', level: 2 })).not.toBeInTheDocument();
	});

	it('searches the description too, not only the name', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.type(screen.getByLabelText('Search modules'), 'XP');
		expect(screen.getByRole('heading', { name: 'Levels', level: 2 })).toBeInTheDocument();
	});

	it('narrows by category', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.click(screen.getByRole('button', { name: 'Safety' }));

		expect(screen.getByRole('heading', { name: 'Moderation', level: 2 })).toBeInTheDocument();
		expect(screen.queryByRole('heading', { name: 'Levels', level: 2 })).not.toBeInTheDocument();
	});

	it('offers an empty state instead of a blank grid', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.type(screen.getByLabelText('Search modules'), 'zzzz');
		expect(screen.getByText('No modules match')).toBeInTheDocument();
	});

	it('flips a module status from the card switch', async () => {
		const user = userEvent.setup();
		renderScreen();

		const card = cardFor('Welcome');
		expect(within(card).getByText('Active')).toBeInTheDocument();

		await user.click(within(card).getByRole('switch'));

		expect(within(cardFor('Welcome')).getByText('Off')).toBeInTheDocument();
	});

	it('counts the active modules in the subheading', () => {
		renderScreen();
		const active = mockModules.filter((module) => module.status === 'active').length;
		expect(
			screen.getByText(new RegExp(`${String(active)} of ${String(mockModules.length)} running`))
		).toBeInTheDocument();
	});

	it('locks premium modules on a free plan and points at billing instead', () => {
		renderScreen(false);

		const economy = cardFor('Economy');
		expect(within(economy).getByRole('switch')).toBeDisabled();
		expect(within(economy).getByRole('link', { name: /Upgrade/ })).toHaveAttribute(
			'href',
			guildHref(GUILD_ID, '/billing')
		);
		expect(within(economy).queryByRole('link', { name: /Configure/ })).not.toBeInTheDocument();
	});

	it('leaves premium modules usable on a paid plan', () => {
		renderScreen(true);

		const economy = cardFor('Economy');
		expect(within(economy).getByRole('switch')).toBeEnabled();
		expect(within(economy).getByRole('link', { name: /Configure/ })).toBeInTheDocument();
	});
});
