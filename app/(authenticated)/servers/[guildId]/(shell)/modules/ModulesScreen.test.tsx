import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { guildHref } from '@/lib/navigation';
import type { ModuleSummary } from '@/lib/types/modules';
import { Translated } from '@/tests/i18n';
import { ModulesScreen } from './ModulesScreen';

const patchModule = vi.hoisted(() => vi.fn());

vi.mock('@/lib/module-client', () => ({ patchModule }));

const success = vi.hoisted(() => vi.fn());
const failure = vi.hoisted(() => vi.fn());
const warning = vi.hoisted(() => vi.fn());

vi.mock('sonner', () => ({
	toast: {
		success: (message: string) => {
			success(message);
		},
		error: (message: string) => {
			failure(message);
		},
		warning: (message: string) => {
			warning(message);
		}
	}
}));

const GUILD_ID = '842315097461823104';

const modules: ModuleSummary[] = [
	{ id: 'welcome', category: 'engagement', status: 'active', version: 3 },
	{ id: 'levels', category: 'engagement', status: 'off', version: 1 },
	{ id: 'moderation', category: 'safety', status: 'active', version: 7 },
	{ id: 'tickets', category: 'community', status: 'off', version: 2 },
	{ id: 'reaction-roles', category: 'community', status: 'off', version: 1 },
	{ id: 'scheduled', category: 'utility', status: 'needs-setup', version: 1 }
];

const stateOf = (key: string, enabled: boolean, version: number) => ({
	key,
	enabled,
	configured: true,
	config: {},
	version
});

function renderScreen(items: ModuleSummary[] = modules) {
	return render(<ModulesScreen modules={items} guildId={GUILD_ID} />, { wrapper: Translated });
}

function cardFor(name: string) {
	return screen.getByRole('heading', { name, level: 2 }).closest('div.group') as HTMLElement;
}

describe('ModulesScreen', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		patchModule.mockResolvedValue({ status: 'saved', state: stateOf('welcome', false, 4) });
	});

	it('shows a card for every module the API listed', () => {
		renderScreen();
		expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(modules.length);
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

	it('narrows by the category the API gave each module', async () => {
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

	it('counts the active modules in the subheading', () => {
		renderScreen();
		const active = modules.filter((module) => module.status === 'active').length;
		expect(
			screen.getByText(new RegExp(`${String(active)} of ${String(modules.length)} running`))
		).toBeInTheDocument();
	});

	it('sends the switch to the API with the version it was given', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.click(within(cardFor('Welcome')).getByRole('switch'));

		await waitFor(() => {
			expect(patchModule).toHaveBeenCalledWith(GUILD_ID, 'welcome', {
				version: 3,
				enabled: false
			});
		});
	});

	it('takes the new version from the answer, so a second flip is not a conflict', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.click(within(cardFor('Welcome')).getByRole('switch'));
		await waitFor(() => {
			expect(within(cardFor('Welcome')).getByText('Off')).toBeInTheDocument();
		});

		patchModule.mockResolvedValue({ status: 'saved', state: stateOf('welcome', true, 5) });
		await user.click(within(cardFor('Welcome')).getByRole('switch'));

		await waitFor(() => {
			expect(patchModule).toHaveBeenLastCalledWith(GUILD_ID, 'welcome', {
				version: 4,
				enabled: true
			});
		});
	});

	it('puts the switch back when the API refuses', async () => {
		const user = userEvent.setup();

		patchModule.mockResolvedValue({ status: 'error', message: 'The API answered 400' });
		renderScreen();

		await user.click(within(cardFor('Welcome')).getByRole('switch'));

		await waitFor(() => {
			expect(failure).toHaveBeenCalledWith('The API answered 400');
		});
		expect(within(cardFor('Welcome')).getByText('Active')).toBeInTheDocument();
	});

	it('adopts what the server holds when somebody else moved it first', async () => {
		const user = userEvent.setup();

		patchModule.mockResolvedValue({ status: 'conflict', state: stateOf('welcome', true, 9) });
		renderScreen();

		await user.click(within(cardFor('Welcome')).getByRole('switch'));

		await waitFor(() => {
			expect(warning).toHaveBeenCalled();
		});
		expect(within(cardFor('Welcome')).getByText('Active')).toBeInTheDocument();
		expect(success).not.toHaveBeenCalled();
	});

	it('shows a module short of a required field as needing setup, and will not flip it', () => {
		renderScreen();

		const card = cardFor('Scheduled messages');

		expect(within(card).getByText('Needs setup')).toBeInTheDocument();
		expect(within(card).getByRole('switch')).toBeDisabled();
	});

	it('reads back what the API says rather than what the click asked for', async () => {
		const user = userEvent.setup();

		patchModule.mockResolvedValue({ status: 'saved', state: stateOf('levels', false, 2) });
		renderScreen();

		await user.click(within(cardFor('Levels')).getByRole('switch'));

		await waitFor(() => {
			expect(within(cardFor('Levels')).getByText('Off')).toBeInTheDocument();
		});
	});
});
