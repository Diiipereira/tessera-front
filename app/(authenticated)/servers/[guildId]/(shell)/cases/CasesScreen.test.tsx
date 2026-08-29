import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Translated } from '@/tests/i18n';
import type { CaseParticipant, ModerationCase } from '@/lib/types/management';
import { CasesScreen } from './CasesScreen';

const toastError = vi.fn();
const listCases = vi.fn();

vi.mock('sonner', () => ({
	toast: {
		error: (...args: unknown[]) => toastError(...args) as unknown,
		success: vi.fn()
	}
}));

vi.mock('@/lib/cases-client', () => ({
	listCases: (...args: unknown[]) => listCases(...args) as unknown
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

const paint = (
	cases: ModerationCase[] = [entry()],
	nextCursor: string | null = null,
	locale: 'en-US' | 'pt-BR' = 'en-US'
) =>
	render(
		<Translated locale={locale}>
			<CasesScreen guildId={GUILD_ID} cases={cases} nextCursor={nextCursor} now={NOW} />
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

	it('says where revoking lives, since the screen cannot do it yet', async () => {
		const user = userEvent.setup();
		paint();

		await user.click(screen.getByRole('button', { name: 'Open case 44' }));

		expect(
			await screen.findByText(
				'Lifting a case is /case revoke in Discord. It is not on this screen yet.'
			)
		).toBeInTheDocument();
	});
});
