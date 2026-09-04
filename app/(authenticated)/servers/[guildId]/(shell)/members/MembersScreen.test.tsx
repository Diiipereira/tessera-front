import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MEMBERS_PER_PAGE, toMembers, type MemberDto } from '@/lib/members';
import type { Role } from '@/lib/types/discord';
import enUS from '@/messages/en-US.json';
import { Translated } from '@/tests/i18n';
import { MembersScreen } from './MembersScreen';

const loadMembers = vi.hoisted(() => vi.fn());
const loadMember = vi.hoisted(() => vi.fn());
const listCases = vi.hoisted(() => vi.fn());

vi.mock('@/lib/members-client', () => ({ loadMembers, loadMember }));
vi.mock('@/lib/cases-client', () => ({ listCases }));

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

const dto = (patch: Partial<MemberDto> = {}): MemberDto => ({
	id: '304918273645102938',
	name: 'Alice',
	handle: 'alice',
	avatarHash: null,
	level: 4,
	xp: 1600,
	earningMessages: 42,
	voiceSeconds: 600,
	lastEarnedAt: '2026-09-01T12:00:00.000Z',
	balance: 1240,
	warnings: 2,
	infractions: 5,
	standing: 'warned',
	...patch
});

const ROLES: Role[] = [{ id: '801234567890123001', name: 'Member', color: '#5865f2' }];

const page = (dtos: MemberDto[], total = dtos.length, searched = false) => ({
	members: toMembers(dtos),
	total,
	searched
});

function renderScreen(
	overrides: Partial<Parameters<typeof MembersScreen>[0]> = {}
): ReturnType<typeof render> {
	return render(
		<MembersScreen
			guildId={GUILD_ID}
			page={page([dto(), dto({ id: '1', name: 'Bruno', handle: 'bruno', warnings: 0 })])}
			memberCount={12431}
			currency="Shards"
			levelsOn
			roles={ROLES}
			now={NOW}
			{...overrides}
		/>,
		{ wrapper: Translated }
	);
}

describe('MembersScreen', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		loadMembers.mockResolvedValue({ status: 'loaded', page: page([dto({ name: 'Carla' })]) });
		loadMember.mockResolvedValue({
			status: 'loaded',
			detail: {
				member: toMembers([dto()])[0],
				present: true,
				nickname: null,
				bot: false,
				roleIds: ['801234567890123001'],
				joinedAt: '2026-02-11T09:15:00.000Z',
				timedOutUntil: null
			}
		});
		listCases.mockResolvedValue({ status: 'ok', page: { cases: [], nextCursor: null } });
	});

	it('shows the page the server rendered without asking again', async () => {
		renderScreen();

		await new Promise((resolve) => {
			setTimeout(resolve, 400);
		});

		expect(loadMembers).not.toHaveBeenCalled();
		expect(screen.getByText('Alice')).toBeInTheDocument();
		expect(screen.getByText('Bruno')).toBeInTheDocument();
	});

	it('shows the numbers the API measured', () => {
		renderScreen();

		const row = screen.getByRole('button', { name: 'Open Alice' });

		expect(within(row).getByText('4')).toBeInTheDocument();
		expect(within(row).getByText('1,240')).toBeInTheDocument();
		expect(within(row).getByText('2')).toBeInTheDocument();
		expect(within(row).getByText(enUS.members.standing.warned)).toBeInTheDocument();
	});

	it('names the currency column after the currency the guild set', () => {
		renderScreen();

		expect(screen.getByRole('columnheader', { name: 'Shards' })).toBeInTheDocument();
	});

	it('names the balance column itself when the guild never named its currency', () => {
		renderScreen({ currency: null });

		expect(screen.getByRole('columnheader', { name: enUS.members.currency })).toBeInTheDocument();
	});

	it('says the counts are asleep when the levels module is off', () => {
		renderScreen({ levelsOn: false });

		expect(screen.getAllByText(enUS.members.levelsOff).length).toBeGreaterThan(0);
	});

	it('asks the API again when the sort changes', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.click(screen.getAllByRole('combobox')[1] as HTMLElement);
		await user.click(await screen.findByRole('option', { name: enUS.members.sort.balance }));

		await waitFor(() => {
			expect(loadMembers).toHaveBeenCalledWith(
				GUILD_ID,
				expect.objectContaining({ sort: 'balance', page: 0 })
			);
		});
		expect(screen.getByText('Carla')).toBeInTheDocument();
	});

	it('asks the API again when the standing filter changes', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.click(screen.getAllByRole('combobox')[0] as HTMLElement);
		await user.click(await screen.findByRole('option', { name: enUS.members.standing.banned }));

		await waitFor(() => {
			expect(loadMembers).toHaveBeenCalledWith(
				GUILD_ID,
				expect.objectContaining({ standing: 'banned' })
			);
		});
	});

	it('searches on what was typed, once the typing settles', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.type(screen.getByLabelText(enUS.members.searchLabel), 'lia');

		await waitFor(() => {
			expect(loadMembers).toHaveBeenCalledWith(GUILD_ID, expect.objectContaining({ query: 'lia' }));
		});
		expect(loadMembers).toHaveBeenCalledTimes(1);
	});

	it('hides the sort while searching, since Discord decides that order', async () => {
		const user = userEvent.setup();
		renderScreen();

		expect(screen.getAllByRole('combobox')).toHaveLength(2);

		await user.type(screen.getByLabelText(enUS.members.searchLabel), 'lia');

		expect(screen.getAllByRole('combobox')).toHaveLength(1);
		expect(screen.getByText(enUS.members.searchNote)).toBeInTheDocument();
	});

	it('goes back to the first page when a filter changes', async () => {
		const user = userEvent.setup();
		renderScreen({ page: page([dto()], MEMBERS_PER_PAGE * 3) });

		await user.click(screen.getByRole('button', { name: enUS.members.nextPage }));
		await waitFor(() => {
			expect(loadMembers).toHaveBeenLastCalledWith(GUILD_ID, expect.objectContaining({ page: 1 }));
		});

		await user.click(screen.getAllByRole('combobox')[0] as HTMLElement);
		await user.click(await screen.findByRole('option', { name: enUS.members.standing.clean }));

		await waitFor(() => {
			expect(loadMembers).toHaveBeenLastCalledWith(GUILD_ID, expect.objectContaining({ page: 0 }));
		});
	});

	it('never offers a page that is not there', () => {
		renderScreen({ page: page([dto()], 1) });

		expect(screen.getByRole('button', { name: enUS.members.nextPage })).toBeDisabled();
		expect(screen.getByRole('button', { name: enUS.members.previousPage })).toBeDisabled();
	});

	it('counts the rows from one, and says how many there are in total', () => {
		renderScreen({ page: page([dto(), dto({ id: '1' })], 90) });

		expect(screen.getByText('Showing 1 to 2 of 90.')).toBeInTheDocument();
	});

	it('hides the paging while searching, since a search is capped instead', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.type(screen.getByLabelText(enUS.members.searchLabel), 'lia');

		expect(screen.queryByRole('button', { name: enUS.members.nextPage })).not.toBeInTheDocument();
	});

	it('keeps the rows on screen when the API refuses', async () => {
		const user = userEvent.setup();

		loadMembers.mockResolvedValue({ status: 'error', message: 'The API answered 500' });
		renderScreen();

		await user.click(screen.getAllByRole('combobox')[0] as HTMLElement);
		await user.click(await screen.findByRole('option', { name: enUS.members.standing.banned }));

		await waitFor(() => {
			expect(failure).toHaveBeenCalledWith(enUS.members.loadFailed, 'The API answered 500');
		});
		expect(screen.getByText('Alice')).toBeInTheDocument();
	});

	it('offers a different empty state for a search than for an empty server', async () => {
		const user = userEvent.setup();

		loadMembers.mockResolvedValue({ status: 'loaded', page: page([], 0, true) });
		renderScreen();

		await user.type(screen.getByLabelText(enUS.members.searchLabel), 'zzz');

		await waitFor(() => {
			expect(screen.getByText(enUS.members.emptySearch)).toBeInTheDocument();
		});
	});

	it('opens the drawer on a row, and reads that member from the API', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.click(screen.getByRole('button', { name: 'Open Alice' }));

		await waitFor(() => {
			expect(loadMember).toHaveBeenCalledWith(GUILD_ID, '304918273645102938');
		});
		expect(listCases).toHaveBeenCalledWith(
			GUILD_ID,
			expect.objectContaining({ targetId: '304918273645102938' })
		);
	});
});
