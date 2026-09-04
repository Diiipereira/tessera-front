import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CommandDto, CommandReportDto } from '@/lib/command-report';
import enUS from '@/messages/en-US.json';
import { Translated } from '@/tests/i18n';
import { CommandsScreen } from './CommandsScreen';

const loadCommands = vi.hoisted(() => vi.fn());

vi.mock('@/lib/commands-client', () => ({ loadCommands }));

const failure = vi.hoisted(() => vi.fn());

vi.mock('sonner', () => ({
	toast: {
		success: () => undefined,
		error: (message: string, data?: { description?: string }) => {
			failure(message, data?.description);
		}
	}
}));

const GUILD_ID = '842315097461823104';
const NOW = '2026-09-04T12:00:00.000Z';

const command = (name: string, patch: Partial<CommandDto> = {}): CommandDto => ({
	name,
	module: 'moderation',
	uses: 0,
	failures: 0,
	lastUsedAt: null,
	subcommands: [],
	...patch
});

const report = (commands: CommandDto[]): CommandReportDto => ({
	since: '2026-08-29T00:00:00.000Z',
	until: '2026-09-05T00:00:00.000Z',
	commands
});

const CATALOG: CommandDto[] = [
	command('warn', { uses: 12, failures: 2, lastUsedAt: '2026-09-04T09:00:00.000Z' }),
	command('ban', { uses: 3 }),
	command('rank', { module: 'levels' }),
	command('config', {
		module: null,
		uses: 5,
		subcommands: [
			{ name: 'welcome', uses: 4, failures: 1, lastUsedAt: null },
			{ name: 'levels', uses: 1, failures: 0, lastUsedAt: null }
		]
	})
];

function renderScreen(commands: CommandDto[] = CATALOG) {
	return render(<CommandsScreen guildId={GUILD_ID} report={report(commands)} now={NOW} />, {
		wrapper: Translated
	});
}

describe('CommandsScreen', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		loadCommands.mockResolvedValue({
			status: 'loaded',
			report: report([command('warn', { uses: 99 })])
		});
	});

	it('lists every command the API sent, used or not', () => {
		renderScreen();

		for (const name of ['/warn', '/ban', '/rank', '/config']) {
			expect(screen.getByRole('button', { name })).toBeInTheDocument();
		}
	});

	it('shows the page the server rendered without asking again', () => {
		renderScreen();

		expect(loadCommands).not.toHaveBeenCalled();
	});

	it('puts the busiest command first', () => {
		renderScreen();

		const names = screen.getAllByRole('button', { name: /^\// }).map((one) => one.textContent);

		expect(names).toEqual(['/warn', '/config', '/ban', '/rank']);
	});

	it('shows the counts the API measured', () => {
		renderScreen();

		const row = screen.getByRole('button', { name: '/warn' }).closest('tr');

		expect(row).not.toBeNull();
		expect(within(row as HTMLElement).getByText('12')).toBeInTheDocument();
		expect(within(row as HTMLElement).getByText('2')).toBeInTheDocument();
	});

	it('says a command was never used instead of showing a date', () => {
		renderScreen();

		const row = screen.getByRole('button', { name: '/rank' }).closest('tr');

		expect(within(row as HTMLElement).getByText(enUS.commands.neverUsed)).toBeInTheDocument();
	});

	it('says how many subcommands a command carries', () => {
		renderScreen();

		expect(screen.getByText('2 subcommands')).toBeInTheDocument();
	});

	it('filters by name as the moderator types', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.type(screen.getByLabelText(enUS.commands.searchLabel), 'ban');

		expect(screen.getByRole('button', { name: '/ban' })).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: '/rank' })).not.toBeInTheDocument();
	});

	it('finds a command by one of its subcommands', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.type(screen.getByLabelText(enUS.commands.searchLabel), 'welcome');

		expect(screen.getByRole('button', { name: '/config' })).toBeInTheDocument();
	});

	it('narrows to a module without asking the API again', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.click(screen.getByRole('combobox'));

		const listbox = await screen.findByRole('listbox');

		await user.click(within(listbox).getByText(enUS.nav.levels));

		expect(screen.getByRole('button', { name: '/rank' })).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: '/warn' })).not.toBeInTheDocument();
		expect(loadCommands).not.toHaveBeenCalled();
	});

	it('hides the commands nobody ran when asked', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.click(screen.getByLabelText(enUS.commands.onlyUsed));

		expect(screen.queryByRole('button', { name: '/rank' })).not.toBeInTheDocument();
		expect(screen.getByRole('button', { name: '/warn' })).toBeInTheDocument();
	});

	it('asks the API again when the window changes, because the count is the servers', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.click(screen.getByRole('button', { name: '30d' }));

		await waitFor(() => {
			expect(loadCommands).toHaveBeenCalledWith(GUILD_ID, 30);
		});
	});

	it('keeps the rows on screen when the API refuses', async () => {
		const user = userEvent.setup();

		loadCommands.mockResolvedValue({ status: 'error', message: 'The API answered 500' });
		renderScreen();

		await user.click(screen.getByRole('button', { name: '30d' }));

		await waitFor(() => {
			expect(failure).toHaveBeenCalledWith(enUS.commands.loadFailed, 'The API answered 500');
		});
		expect(screen.getByRole('button', { name: '/warn' })).toBeInTheDocument();
	});

	it('says where command permissions actually live', () => {
		renderScreen();

		expect(screen.getByText(enUS.commands.permissionsNote)).toBeInTheDocument();
	});

	it('offers no switch, no cooldown and no role picker, because none of them exist', () => {
		renderScreen();

		expect(screen.queryByRole('switch')).not.toBeInTheDocument();
		expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
	});

	it('opens the drawer on a command and breaks the uses down by subcommand', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.click(screen.getByRole('button', { name: '/config' }));

		expect(await screen.findByText('/config welcome')).toBeInTheDocument();
		expect(screen.getByText('/config levels')).toBeInTheDocument();
	});

	it('explains in the drawer what a failure is, so the number is not read as a refusal', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.click(screen.getByRole('button', { name: '/warn' }));

		expect(await screen.findByText(enUS.commands.drawer.failureMeaning)).toBeInTheDocument();
	});

	it('offers a different empty state than an empty table', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.type(screen.getByLabelText(enUS.commands.searchLabel), 'zzzz');

		expect(screen.getByText(enUS.commands.emptyTitle)).toBeInTheDocument();
	});
});
