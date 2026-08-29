import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CapabilityCatalogDto, TeamListDto, TeamSeatDto } from '@/lib/api-url';
import enUS from '@/messages/en-US.json';
import ptBR from '@/messages/pt-BR.json';
import { Translated } from '@/tests/i18n';
import { TeamScreen } from './TeamScreen';

const refresh = vi.fn();
const toastError = vi.fn();
const toastSuccess = vi.fn();
const putSeat = vi.fn();
const deleteSeat = vi.fn();
const writeText = vi.fn();

vi.mock('sonner', () => ({
	toast: {
		error: (...args: unknown[]) => toastError(...args) as unknown,
		success: (...args: unknown[]) => toastSuccess(...args) as unknown
	}
}));

vi.mock('next/navigation', () => ({
	useRouter: () => ({ refresh })
}));

vi.mock('@/lib/team-client', () => ({
	putSeat: (...args: unknown[]) => putSeat(...args) as unknown,
	deleteSeat: (...args: unknown[]) => deleteSeat(...args) as unknown
}));

const GUILD_ID = '842315097461823104';
const OWNER_ID = '304918273645102938';
const ADMIN_ID = '512038475610293847';
const VIEWER_ID = '628374651029384756';
const NEWCOMER_ID = '739284756102938475';

const catalog: CapabilityCatalogDto = {
	capabilities: [
		{
			key: 'modules.read',
			label: 'capabilities.modules.read.label',
			description: 'capabilities.modules.read.description'
		},
		{
			key: 'modules.write',
			label: 'capabilities.modules.write.label',
			description: 'capabilities.modules.write.description'
		}
	],
	roles: ['owner', 'admin', 'moderator', 'viewer'],
	presets: {
		owner: ['modules.read', 'modules.write', 'team.manage'],
		admin: ['modules.read', 'modules.write', 'team.manage'],
		moderator: ['modules.read'],
		viewer: ['modules.read']
	}
};

const seat = (over: Partial<TeamSeatDto> & Pick<TeamSeatDto, 'userId'>): TeamSeatDto => ({
	username: 'someone',
	globalName: null,
	avatarHash: null,
	role: 'viewer',
	source: 'guild-staff',
	grantedBy: 'lia',
	grantedAt: '2026-08-20T10:00:00.000Z',
	lastSeenAt: '2026-08-27T10:00:00.000Z',
	...over
});

const team: TeamListDto = {
	viewerId: ADMIN_ID,
	viewerRole: 'admin',
	seats: [
		seat({
			userId: OWNER_ID,
			username: 'lia.exe',
			globalName: 'lia',
			role: 'owner',
			source: 'guild-owner',
			grantedBy: null,
			grantedAt: null
		}),
		seat({ userId: ADMIN_ID, username: 'okra', globalName: 'okra', role: 'admin' }),
		seat({ userId: VIEWER_ID, username: 'panela.dev', role: 'viewer', lastSeenAt: null })
	]
};

function renderScreen(over: Partial<TeamListDto> = {}) {
	return render(
		<Translated>
			<TeamScreen
				guildId={GUILD_ID}
				catalog={catalog}
				team={{ ...team, ...over }}
				now="2026-08-28T10:00:00.000Z"
			/>
		</Translated>
	);
}

const sectionOf = (title: string): HTMLElement => {
	const section = screen.getByRole('heading', { name: title }).closest('section');

	if (section === null) throw new Error(`"${title}" is not inside a section`);

	return section;
};

const accessRows = (): HTMLElement[] =>
	within(sectionOf(enUS.team.access.title)).getAllByRole('row');

const rowFor = (name: string): HTMLElement => {
	const row = accessRows().find((entry) => entry.textContent.includes(name));

	if (row === undefined) throw new Error(`No access row for ${name}`);

	return row;
};

const openDialog = async (): Promise<void> => {
	await userEvent.click(screen.getByRole('button', { name: enUS.team.add }));
};

const submitButton = (): HTMLElement =>
	screen.getByRole('button', { name: enUS.team.dialog.submit });

beforeEach(() => {
	vi.clearAllMocks();
	putSeat.mockResolvedValue({ status: 'saved', seat: seat({ userId: VIEWER_ID }) });
	deleteSeat.mockResolvedValue({ status: 'removed' });
	writeText.mockResolvedValue(undefined);
	Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
});

describe('TeamScreen access table', () => {
	it('lists one row per seat the API sent, not a list of its own', () => {
		renderScreen();

		expect(accessRows().slice(1)).toHaveLength(team.seats.length);
	});

	it('shows the handle the API sent, so nothing is invented locally', () => {
		renderScreen();

		expect(within(rowFor('panela.dev')).getByText('@panela.dev')).toBeDefined();
	});

	it('credits Discord for the owner seat, which no grant created', () => {
		renderScreen();

		expect(within(rowFor('lia')).getByText(enUS.team.access.fromDiscord)).toBeDefined();
	});

	it('says never for someone who has not signed in, rather than a bogus date', () => {
		renderScreen();

		expect(within(rowFor('panela.dev')).getByText(enUS.team.access.never)).toBeDefined();
	});

	it('marks which row is you', () => {
		renderScreen();

		expect(within(rowFor('okra')).getByText(enUS.team.access.you)).toBeDefined();
	});

	it('leaves the owner seat and your own seat without controls, as the API refuses both', () => {
		renderScreen();

		expect(within(rowFor('lia')).queryByRole('combobox')).toBeNull();
		expect(within(rowFor('okra')).queryByRole('combobox')).toBeNull();
		expect(within(rowFor('panela.dev')).getByRole('combobox')).toBeDefined();
	});

	it('offers no control at all to a seat that cannot manage the team', () => {
		renderScreen({ viewerId: VIEWER_ID, viewerRole: 'viewer' });

		expect(within(sectionOf(enUS.team.access.title)).queryByRole('combobox')).toBeNull();
		expect(screen.getByRole('button', { name: enUS.team.add })).toBeDisabled();
	});
});

describe('TeamScreen writes', () => {
	it('removes a seat through the API and reloads the page data', async () => {
		renderScreen();

		await userEvent.click(
			within(rowFor('panela.dev')).getByRole('button', {
				name: enUS.team.access.remove.replace('{name}', 'panela.dev')
			})
		);

		await waitFor(() => {
			expect(deleteSeat).toHaveBeenCalledWith(GUILD_ID, VIEWER_ID);
		});
		expect(refresh).toHaveBeenCalled();
	});

	it('keeps the row and reports the reason when the API refuses', async () => {
		deleteSeat.mockResolvedValue({ status: 'error', message: 'You cannot change your own seat' });
		renderScreen();

		await userEvent.click(
			within(rowFor('panela.dev')).getByRole('button', {
				name: enUS.team.access.remove.replace('{name}', 'panela.dev')
			})
		);

		await waitFor(() => {
			expect(toastError).toHaveBeenCalledWith('You cannot change your own seat');
		});
		expect(refresh).not.toHaveBeenCalled();
	});
});

describe('TeamScreen adds someone by id', () => {
	it('asks for the id, because the seat needs to name a person', async () => {
		renderScreen();
		await openDialog();

		expect(screen.getByRole('textbox')).toBeDefined();
	});

	it('refuses to submit while the id is not a snowflake, before spending a request', async () => {
		renderScreen();
		await openDialog();

		expect(submitButton()).toBeDisabled();

		await userEvent.type(screen.getByRole('textbox'), '42');

		expect(submitButton()).toBeDisabled();
		expect(screen.getByText(enUS.team.dialog.userIdInvalid)).toBeDefined();
		expect(putSeat).not.toHaveBeenCalled();
	});

	it('seats the id that was typed, on the seat that was picked', async () => {
		putSeat.mockResolvedValue({
			status: 'saved',
			seat: seat({ userId: NEWCOMER_ID, username: 'newcomer' })
		});
		renderScreen();
		await openDialog();

		await userEvent.type(screen.getByRole('textbox'), NEWCOMER_ID);
		await userEvent.click(submitButton());

		await waitFor(() => {
			expect(putSeat).toHaveBeenCalledWith(GUILD_ID, NEWCOMER_ID, 'viewer');
		});
		expect(refresh).toHaveBeenCalled();
	});

	it('names the person the API answered with, not the id that was typed', async () => {
		putSeat.mockResolvedValue({
			status: 'saved',
			seat: seat({ userId: NEWCOMER_ID, username: 'newcomer', globalName: 'Newcomer' })
		});
		renderScreen();
		await openDialog();

		await userEvent.type(screen.getByRole('textbox'), NEWCOMER_ID);
		await userEvent.click(submitButton());

		await waitFor(() => {
			expect(toastSuccess).toHaveBeenCalledWith(
				enUS.team.access.added
					.replace('{name}', 'Newcomer')
					.replace('{role}', enUS.team.role.viewer),
				{ description: enUS.team.access.addedHint }
			);
		});
	});

	it('keeps the dialog open and says why when the API refuses the id', async () => {
		putSeat.mockResolvedValue({ status: 'error', message: 'No Discord user with that id' });
		renderScreen();
		await openDialog();

		await userEvent.type(screen.getByRole('textbox'), NEWCOMER_ID);
		await userEvent.click(submitButton());

		await waitFor(() => {
			expect(toastError).toHaveBeenCalledWith('No Discord user with that id');
		});
		expect(screen.getByRole('textbox')).toBeDefined();
		expect(refresh).not.toHaveBeenCalled();
	});
});

describe('TeamScreen hands over the dashboard address', () => {
	const copyButton = (): HTMLElement =>
		within(rowFor('panela.dev')).getByRole('button', {
			name: enUS.team.access.copyAddress.replace('{name}', 'panela.dev')
		});

	it('copies a plain address, not a token — the seat is what grants access', async () => {
		renderScreen();

		await userEvent.click(copyButton());

		expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/servers/${GUILD_ID}`);
	});

	it('confirms the copy, so the click is not silent', async () => {
		renderScreen();

		await userEvent.click(copyButton());

		await waitFor(() => {
			expect(toastSuccess).toHaveBeenCalledWith(enUS.team.access.addressCopied);
		});
	});

	it('says so when the browser refuses, instead of pretending it copied', async () => {
		writeText.mockRejectedValue(new Error('denied'));
		renderScreen();

		await userEvent.click(copyButton());

		await waitFor(() => {
			expect(toastError).toHaveBeenCalledWith(enUS.team.access.copyRefused);
		});
	});

	it('tells you to send the address right after the seat is created', async () => {
		putSeat.mockResolvedValue({
			status: 'saved',
			seat: seat({ userId: NEWCOMER_ID, username: 'newcomer' })
		});
		renderScreen();
		await openDialog();

		await userEvent.type(screen.getByRole('textbox'), NEWCOMER_ID);
		await userEvent.click(submitButton());

		await waitFor(() => {
			expect(toastSuccess).toHaveBeenCalledWith(expect.any(String), {
				description: enUS.team.access.addedHint
			});
		});
	});

	it('offers nothing to copy to a seat that cannot manage the team', () => {
		renderScreen({ viewerId: VIEWER_ID, viewerRole: 'viewer' });

		expect(
			screen.queryByRole('button', {
				name: enUS.team.access.copyAddress.replace('{name}', 'panela.dev')
			})
		).toBeNull();
	});
});

describe('TeamScreen dates', () => {
	const inPortuguese = (over: Partial<TeamListDto> = {}) =>
		render(
			<Translated locale="pt-BR">
				<TeamScreen
					guildId={GUILD_ID}
					catalog={catalog}
					team={{ ...team, ...over }}
					now="2026-08-28T10:00:00.000Z"
				/>
			</Translated>
		);

	it('writes the last-seen date in the reader language, not in English', () => {
		inPortuguese();

		expect(screen.getAllByText('há 1 dia').length).toBeGreaterThan(0);
		expect(screen.queryByText('1 day ago')).toBeNull();
	});

	it('translates the just-now window, which used to leak English into the table', () => {
		inPortuguese({
			seats: [seat({ userId: VIEWER_ID, grantedAt: '2026-08-28T09:59:50.000Z' })]
		});

		expect(screen.getByText(ptBR.common.justNow)).toBeInTheDocument();
		expect(screen.queryByText('just now')).toBeNull();
	});
});

describe('TeamScreen matrix', () => {
	it('lists one row per capability the API sent', () => {
		renderScreen();

		expect(within(sectionOf(enUS.team.matrix.title)).getAllByRole('row').slice(1)).toHaveLength(
			catalog.capabilities.length
		);
	});

	it('marks a capability granted for one seat and withheld for another', () => {
		renderScreen();

		const row = within(sectionOf(enUS.team.matrix.title))
			.getAllByRole('row')
			.find((entry) => entry.textContent.includes(enUS.capabilities.modules.write.label));

		expect(within(row as HTMLElement).getAllByText(enUS.team.granted)).toHaveLength(2);
		expect(within(row as HTMLElement).getAllByText(enUS.team.notGranted)).toHaveLength(2);
	});

	it('names the Discord fallback seat as Admin, which is the role the API grants', () => {
		renderScreen();

		expect(screen.getByText(enUS.team.discordTitle).closest('div')?.textContent).toContain(
			enUS.team.role.admin
		);
	});
});
