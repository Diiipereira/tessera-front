import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Translated } from '@/tests/i18n';
import type { CapabilityCatalogDto } from '@/lib/api-url';
import type { CaseParticipant, ModerationCase, TeamRole } from '@/lib/types/management';
import { CasesScreen } from './CasesScreen';

const toastError = vi.fn();
const toastSuccess = vi.fn();
const listCases = vi.fn();
const revokeCase = vi.fn();

vi.mock('sonner', () => ({
	toast: {
		error: (...args: unknown[]) => toastError(...args) as unknown,
		success: (...args: unknown[]) => toastSuccess(...args) as unknown
	}
}));

vi.mock('@/lib/cases-client', () => ({
	listCases: (...args: unknown[]) => listCases(...args) as unknown,
	revokeCase: (...args: unknown[]) => revokeCase(...args) as unknown
}));

const GUILD_ID = '842315097461823104';
const NOW = '2026-08-29T12:00:00.000Z';

const person = (over: Partial<CaseParticipant> = {}): CaseParticipant => ({
	id: '444444444444444444',
	name: 'Tigre',
	handle: 'tigre',
	avatarHash: null,
	...over
});

const entry = (over: Partial<ModerationCase> = {}): ModerationCase => ({
	id: 'uuid-1',
	number: 44,
	type: 'timeout',
	target: person(),
	moderator: person({ id: '555555555555555555', name: 'Lia', handle: 'lia' }),
	reason: 'Kept arguing after a warning',
	durationSeconds: 3600,
	expiresAt: '2026-08-29T13:00:00.000Z',
	active: true,
	revokedAt: null,
	revokedBy: null,
	revokeReason: null,
	createdAt: '2026-08-29T11:00:00.000Z',
	...over
});

const CATALOG: CapabilityCatalogDto = {
	capabilities: [],
	roles: ['owner', 'admin', 'moderator', 'viewer'],
	presets: {
		owner: ['cases.read', 'cases.write'],
		admin: ['cases.read', 'cases.write'],
		moderator: ['cases.read', 'cases.write'],
		viewer: ['cases.read']
	}
};

const paint = (
	cases: ModerationCase[] = [entry()],
	nextCursor: string | null = null,
	locale: 'en-US' | 'pt-BR' = 'en-US',
	role: TeamRole = 'moderator'
) =>
	render(
		<Translated locale={locale}>
			<CasesScreen
				guildId={GUILD_ID}
				catalog={CATALOG}
				viewerRole={role}
				cases={cases}
				nextCursor={nextCursor}
				now={NOW}
			/>
		</Translated>
	);

describe('CasesScreen', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		listCases.mockResolvedValue({ status: 'ok', page: { cases: [], nextCursor: null } });
	});

	it('shows the case number, the action and both people', () => {
		paint();
		const table = screen.getByRole('table');

		expect(within(table).getByText('#44')).toBeInTheDocument();
		expect(within(table).getByText('Timeout')).toBeInTheDocument();
		expect(within(table).getByText('Tigre')).toBeInTheDocument();
		expect(within(table).getByText('Lia')).toBeInTheDocument();
	});

	it('names a member the API could not resolve by their id, not by nothing', () => {
		paint([entry({ target: person({ name: null, handle: null }) })]);
		const table = screen.getByRole('table');

		expect(within(table).getByText('444444444444444444')).toBeInTheDocument();
	});

	it('says a case with no reason has none, rather than leaving the cell blank', () => {
		paint([entry({ reason: null })]);

		expect(screen.getByText('No reason given')).toBeInTheDocument();
	});

	it('calls a standing timeout in force', () => {
		paint();
		const table = screen.getByRole('table');

		expect(within(table).getByText('In force')).toBeInTheDocument();
	});

	it('calls a kick done, since it left nothing standing', () => {
		paint([entry({ type: 'kick', active: false, expiresAt: null })]);
		const table = screen.getByRole('table');

		expect(within(table).getByText('Done')).toBeInTheDocument();
	});

	it('calls a lifted case revoked', () => {
		paint([entry({ revokedAt: '2026-08-29T11:30:00.000Z' })]);
		const table = screen.getByRole('table');

		expect(within(table).getByText('Revoked')).toBeInTheDocument();
	});

	it('translates the action and the status into the reader language', () => {
		paint([entry({ type: 'ban', active: true, expiresAt: null })], null, 'pt-BR');
		const table = screen.getByRole('table');

		expect(within(table).getByText('Banimento')).toBeInTheDocument();
		expect(within(table).getByText('Em vigor')).toBeInTheDocument();
	});

	it('sends the action filter to the API, since a page cannot be filtered on the client', async () => {
		const user = userEvent.setup();
		paint();

		await user.click(screen.getByRole('combobox'));
		await user.click(screen.getByRole('option', { name: 'Ban' }));

		await waitFor(() => {
			expect(listCases).toHaveBeenCalledWith(GUILD_ID, expect.objectContaining({ type: 'ban' }));
		});
	});

	it('sends the status filter to the API too', async () => {
		const user = userEvent.setup();
		paint();

		await user.click(screen.getByRole('button', { name: 'Revoked', pressed: false }));

		await waitFor(() => {
			expect(listCases).toHaveBeenCalledWith(
				GUILD_ID,
				expect.objectContaining({ status: 'revoked' })
			);
		});
	});

	it('offers no load button when the first page was every case', () => {
		paint([entry()], null);

		expect(screen.queryByRole('button', { name: 'Load older cases' })).not.toBeInTheDocument();
		expect(screen.getByText('That is every case on record.')).toBeInTheDocument();
	});

	it('appends the next page instead of replacing what is on screen', async () => {
		const user = userEvent.setup();
		listCases.mockResolvedValue({
			status: 'ok',
			page: { cases: [entry({ id: 'uuid-2', number: 43, type: 'ban' })], nextCursor: null }
		});
		paint([entry()], '44');

		await user.click(screen.getByRole('button', { name: 'Load older cases' }));

		await waitFor(() => {
			expect(screen.getByText('#43')).toBeInTheDocument();
		});
		expect(screen.getByText('#44')).toBeInTheDocument();
	});

	it('asks for the next page with the cursor it was given', async () => {
		const user = userEvent.setup();
		paint([entry()], '44');

		await user.click(screen.getByRole('button', { name: 'Load older cases' }));

		await waitFor(() => {
			expect(listCases).toHaveBeenCalledWith(GUILD_ID, expect.objectContaining({ cursor: '44' }));
		});
	});

	it('says the read failed instead of blanking the table', async () => {
		const user = userEvent.setup();
		listCases.mockResolvedValue({ status: 'error', message: 'No dashboard access' });
		paint([entry()], '44');

		await user.click(screen.getByRole('button', { name: 'Load older cases' }));

		await waitFor(() => {
			expect(toastError).toHaveBeenCalled();
		});
		expect(screen.getByText('#44')).toBeInTheDocument();
	});

	it('opens the drawer on the row that was clicked', async () => {
		const user = userEvent.setup();
		paint();

		await user.click(screen.getByRole('button', { name: 'Open case 44' }));

		expect(await screen.findByRole('dialog')).toBeInTheDocument();
		expect(screen.getByText('Case #44')).toBeInTheDocument();
	});

	it('says what kind of case it is, which only the rows below used to say', async () => {
		const user = userEvent.setup();
		paint([entry({ type: 'ban', expiresAt: null })]);

		await user.click(screen.getByRole('button', { name: 'Open case 44' }));

		const drawer = await screen.findByRole('dialog');

		expect(within(drawer).getByText('Ban')).toBeInTheDocument();
	});

	it('names the kind in the reader language', async () => {
		const user = userEvent.setup();
		paint([entry({ type: 'ban', expiresAt: null })], null, 'pt-BR');

		await user.click(screen.getByRole('button', { name: 'Abrir o caso 44' }));

		const drawer = await screen.findByRole('dialog');

		expect(within(drawer).getByText('Banimento')).toBeInTheDocument();
	});

	it('explains what the status means inside the drawer', async () => {
		const user = userEvent.setup();
		paint();

		await user.click(screen.getByRole('button', { name: 'Open case 44' }));

		expect(await screen.findByText('The punishment is still in place.')).toBeInTheDocument();
	});

	it('reads the duration in words rather than in seconds', async () => {
		const user = userEvent.setup();
		paint([entry({ durationSeconds: 86400 })]);

		await user.click(screen.getByRole('button', { name: 'Open case 44' }));

		expect(await screen.findByText('1 day')).toBeInTheDocument();
	});

	it('says a case with no end has none, instead of showing an empty duration', async () => {
		const user = userEvent.setup();
		paint([entry({ durationSeconds: null, expiresAt: null })]);

		await user.click(screen.getByRole('button', { name: 'Open case 44' }));

		expect(await screen.findByText('No end date')).toBeInTheDocument();
	});

	it('looks up the other cases for the same member', async () => {
		const user = userEvent.setup();
		paint();

		await user.click(screen.getByRole('button', { name: 'Open case 44' }));

		await waitFor(() => {
			expect(listCases).toHaveBeenCalledWith(
				GUILD_ID,
				expect.objectContaining({ targetId: '444444444444444444' })
			);
		});
	});

	it('tells a viewer why there is nothing to press', async () => {
		const user = userEvent.setup();
		paint([entry()], null, 'en-US', 'viewer');

		await user.click(screen.getByRole('button', { name: 'Open case 44' }));

		expect(await screen.findByText('Only moderators can undo a case.')).toBeInTheDocument();
	});

	const withdrawn = (over: Partial<CaseParticipant> = {}): ModerationCase =>
		entry({
			active: false,
			revokedAt: '2026-08-29T11:30:00.000Z',
			revokedBy: person({ id: '999999999999999999', name: 'Rafa', handle: 'rafa', ...over }),
			revokeReason: 'Warned the wrong person'
		});

	it('names who withdrew the case, which the drawer never used to say', async () => {
		const user = userEvent.setup();
		paint([withdrawn()]);

		await user.click(screen.getByRole('button', { name: 'Open case 44' }));

		expect(await screen.findByText('Lifted by')).toBeInTheDocument();
		expect(screen.getByText('Rafa')).toBeInTheDocument();
	});

	it('falls back to the handle, then the id, so the row is never blank', async () => {
		const user = userEvent.setup();
		paint([withdrawn({ name: null, handle: null })]);

		await user.click(screen.getByRole('button', { name: 'Open case 44' }));

		expect(await screen.findByText('999999999999999999')).toBeInTheDocument();
	});

	it('says nothing about who withdrew a case that nobody withdrew', async () => {
		const user = userEvent.setup();
		paint();

		await user.click(screen.getByRole('button', { name: 'Open case 44' }));

		await screen.findByRole('dialog');

		expect(screen.queryByText('Lifted by')).not.toBeInTheDocument();
	});

	it('names the withdrawer in Portuguese too', async () => {
		const user = userEvent.setup();
		paint([withdrawn()], null, 'pt-BR');

		await user.click(screen.getByRole('button', { name: 'Abrir o caso 44' }));

		expect(await screen.findByText('Levantado por')).toBeInTheDocument();
	});
});

describe('undoing a case from the drawer', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		listCases.mockResolvedValue({ status: 'ok', page: { cases: [], nextCursor: null } });
		revokeCase.mockResolvedValue({
			status: 'ok',
			revoked: { case: entry({ revokedAt: '2026-08-29T12:00:00.000Z' }), createdNumber: null }
		});
	});

	const open = async (over: Partial<ModerationCase> = {}, role: TeamRole = 'moderator') => {
		const user = userEvent.setup();
		paint([entry(over)], null, 'en-US', role);

		await user.click(screen.getByRole('button', { name: 'Open case 44' }));
		await screen.findByRole('dialog');

		return user;
	};

	it('offers to withdraw a warning, which changes nothing in Discord', async () => {
		await open({ type: 'warn', expiresAt: null });

		expect(screen.getByRole('button', { name: 'Withdraw case' })).toBeInTheDocument();
		expect(
			screen.getByText('This clears the record. Nothing changes in Discord.')
		).toBeInTheDocument();
	});

	it('offers to lift a ban, and says it acts in Discord', async () => {
		await open({ type: 'ban', expiresAt: null });

		expect(screen.getByRole('button', { name: 'Lift the ban' })).toBeInTheDocument();
		expect(screen.getByText('This acts in Discord right now, not just here.')).toBeInTheDocument();
	});

	it('offers to let a timed out member talk again', async () => {
		await open({ type: 'timeout' });

		expect(screen.getByRole('button', { name: 'Let them talk again' })).toBeInTheDocument();
	});

	it('offers nothing on a case that was already withdrawn', async () => {
		await open({ type: 'warn', revokedAt: '2026-08-29T11:30:00.000Z' });

		expect(screen.queryByRole('button', { name: 'Withdraw case' })).not.toBeInTheDocument();
	});

	it('offers nothing on a lift, because undoing one means punishing again', async () => {
		await open({ type: 'unban', expiresAt: null });

		expect(screen.queryByRole('button', { name: 'Withdraw case' })).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Lift the ban' })).not.toBeInTheDocument();
	});

	it('shows a viewer nothing to press, since the API would refuse them', async () => {
		await open({ type: 'ban', expiresAt: null }, 'viewer');

		expect(screen.queryByRole('button', { name: 'Lift the ban' })).not.toBeInTheDocument();
	});

	it('sends the case number and no reason when the box is empty', async () => {
		const user = await open({ type: 'warn', expiresAt: null });

		await user.click(screen.getByRole('button', { name: 'Withdraw case' }));

		await waitFor(() => {
			expect(revokeCase).toHaveBeenCalledWith(GUILD_ID, 44, null);
		});
	});

	it('sends the reason the moderator typed, trimmed', async () => {
		const user = await open({ type: 'warn', expiresAt: null });

		await user.type(screen.getByRole('textbox'), '  Wrong person  ');
		await user.click(screen.getByRole('button', { name: 'Withdraw case' }));

		await waitFor(() => {
			expect(revokeCase).toHaveBeenCalledWith(GUILD_ID, 44, 'Wrong person');
		});
	});

	it('says which case fell', async () => {
		const user = await open({ type: 'warn', expiresAt: null });

		await user.click(screen.getByRole('button', { name: 'Withdraw case' }));

		await waitFor(() => {
			expect(toastSuccess).toHaveBeenCalledWith('Case #44 withdrawn.');
		});
	});

	it('names the case the lift opened, so the new row is not a surprise', async () => {
		revokeCase.mockResolvedValue({
			status: 'ok',
			revoked: { case: entry({ revokedAt: '2026-08-29T12:00:00.000Z' }), createdNumber: 45 }
		});

		const user = await open({ type: 'ban', expiresAt: null });

		await user.click(screen.getByRole('button', { name: 'Lift the ban' }));

		await waitFor(() => {
			expect(toastSuccess).toHaveBeenCalledWith(
				'Case #44 withdrawn, and case #45 opened for the lift.'
			);
		});
	});

	it('says what went wrong instead of pretending it worked', async () => {
		revokeCase.mockResolvedValue({ status: 'error', message: 'Discord refused the action' });

		const user = await open({ type: 'ban', expiresAt: null });

		await user.click(screen.getByRole('button', { name: 'Lift the ban' }));

		await waitFor(() => {
			expect(toastError).toHaveBeenCalled();
		});
		expect(toastSuccess).not.toHaveBeenCalled();
	});

	it('reloads the list, so the row and any new case are both current', async () => {
		const user = await open({ type: 'warn', expiresAt: null });

		await user.click(screen.getByRole('button', { name: 'Withdraw case' }));

		await waitFor(() => {
			expect(listCases).toHaveBeenCalled();
		});
	});

	it('labels the buttons in Portuguese too', async () => {
		const user = userEvent.setup();
		paint([entry({ type: 'ban', expiresAt: null })], null, 'pt-BR');

		await user.click(screen.getByRole('button', { name: 'Abrir o caso 44' }));
		await screen.findByRole('dialog');

		expect(screen.getByRole('button', { name: 'Desbanir' })).toBeInTheDocument();
	});
});
