import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Translated } from '@/tests/i18n';
import type { AuditEntry } from '@/lib/types/management';
import { AuditScreen } from './AuditScreen';

const toastError = vi.fn();
const toastSuccess = vi.fn();
const readAudit = vi.fn();

vi.mock('sonner', () => ({
	toast: {
		error: (...args: unknown[]) => toastError(...args) as unknown,
		success: (...args: unknown[]) => toastSuccess(...args) as unknown
	}
}));

vi.mock('@/lib/audit-client', () => ({
	readAudit: (...args: unknown[]) => readAudit(...args) as unknown
}));

const GUILD_ID = '842315097461823104';
const ACTOR_ID = '304918273645102938';

const NOW = '2026-08-29T12:00:00.000Z';

const entry = (over: Partial<AuditEntry> = {}): AuditEntry => ({
	id: '1',
	moduleKey: 'welcome',
	path: 'welcome.channelId',
	before: null,
	after: '111111111111111111',
	actor: { id: ACTOR_ID, name: 'Lia', avatarHash: null },
	source: 'web',
	at: '2026-08-29T11:00:00.000Z',
	...over
});

const paint = (
	entries: AuditEntry[] = [entry()],
	nextCursor: string | null = null,
	locale: 'en-US' | 'pt-BR' = 'en-US'
) =>
	render(
		<Translated locale={locale}>
			<AuditScreen
				guildId={GUILD_ID}
				entries={entries}
				nextCursor={nextCursor}
				moduleKeys={['welcome', 'moderation']}
				now={NOW}
			/>
		</Translated>
	);

describe('AuditScreen', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		readAudit.mockResolvedValue({ status: 'ok', page: { entries: [], nextCursor: null } });
	});

	it('names the field in words, never as the stored path', () => {
		paint();

		expect(screen.getByText('Welcome channel')).toBeInTheDocument();
	});

	it('names the module switch, which has no field declaration to borrow from', () => {
		paint([entry({ path: 'welcome.enabled', before: false, after: true })]);

		expect(screen.getByText('Module switch')).toBeInTheDocument();
	});

	it('falls back to the raw key rather than showing nothing for a retired field', () => {
		paint([entry({ path: 'welcome.longGone' })]);

		expect(screen.getByText('Long gone')).toBeInTheDocument();
	});

	it('says who made the change', () => {
		paint();

		expect(screen.getByText('Lia')).toBeInTheDocument();
	});

	it('keeps the entry readable when the account is gone', () => {
		paint([entry({ actor: { id: null, name: null, avatarHash: null } })]);

		expect(screen.getByText('Removed account')).toBeInTheDocument();
	});

	it('names the source in words instead of the enum value', () => {
		paint([entry({ source: 'slash' })]);
		const list = screen.getByRole('list');

		expect(within(list).getByText('Slash command')).toBeInTheDocument();
		expect(within(list).queryByText('slash')).not.toBeInTheDocument();
	});

	it('translates the source and the field into the reader language', () => {
		paint([entry({ source: 'slash' })], null, 'pt-BR');
		const list = screen.getByRole('list');

		expect(within(list).getByText('Comando de barra')).toBeInTheDocument();
		expect(within(list).getByText('Canal de boas-vindas')).toBeInTheDocument();
	});

	it('shows the before and after when the row is opened', async () => {
		const user = userEvent.setup();
		paint([entry({ before: null, after: '111111111111111111' })]);

		await user.click(screen.getByRole('button', { expanded: false }));

		expect(screen.getByText('111111111111111111')).toBeInTheDocument();
		expect(screen.getByText('none')).toBeInTheDocument();
	});

	it('reads a boolean as on and off rather than true and false', async () => {
		const user = userEvent.setup();
		paint([entry({ path: 'welcome.useEmbed', before: false, after: true })]);

		await user.click(screen.getByRole('button', { expanded: false }));

		const rows = screen.getAllByRole('cell');

		expect(within(rows[1] as HTMLElement).getByText('off')).toBeInTheDocument();
		expect(within(rows[2] as HTMLElement).getByText('on')).toBeInTheDocument();
	});

	it('explains the missing account only where it applies', async () => {
		const user = userEvent.setup();
		paint([entry({ actor: { id: null, name: null, avatarHash: null } })]);

		await user.click(screen.getByRole('button', { expanded: false }));

		expect(
			screen.getByText('The account that made this change no longer exists. The entry stays.')
		).toBeInTheDocument();
	});

	it('offers no load button when the first page was the whole log', () => {
		paint([entry()], null);

		expect(screen.queryByRole('button', { name: 'Load older entries' })).not.toBeInTheDocument();
		expect(screen.getByText('That is every retained entry.')).toBeInTheDocument();
	});

	it('asks the API for the next page with the cursor it was given', async () => {
		const user = userEvent.setup();
		paint([entry()], '1787997840000.42');

		await user.click(screen.getByRole('button', { name: 'Load older entries' }));

		await waitFor(() => {
			expect(readAudit).toHaveBeenCalledWith(
				GUILD_ID,
				expect.objectContaining({ cursor: '1787997840000.42' })
			);
		});
	});

	it('appends the next page instead of replacing what is on screen', async () => {
		const user = userEvent.setup();
		readAudit.mockResolvedValue({
			status: 'ok',
			page: { entries: [entry({ id: '2', path: 'welcome.message' })], nextCursor: null }
		});
		paint([entry()], '1787997840000.42');

		await user.click(screen.getByRole('button', { name: 'Load older entries' }));

		await waitFor(() => {
			expect(screen.getByText('Welcome message')).toBeInTheDocument();
		});
		expect(screen.getByText('Welcome channel')).toBeInTheDocument();
	});

	it('sends the module filter to the API, since a page cannot be filtered on the client', async () => {
		const user = userEvent.setup();
		paint();

		await user.click(screen.getByRole('combobox'));
		await user.click(screen.getByRole('option', { name: 'Moderation' }));

		await waitFor(() => {
			expect(readAudit).toHaveBeenCalledWith(
				GUILD_ID,
				expect.objectContaining({ moduleKey: 'moderation' })
			);
		});
	});

	it('replaces the list when a filter changes, rather than appending to it', async () => {
		const user = userEvent.setup();
		readAudit.mockResolvedValue({
			status: 'ok',
			page: {
				entries: [entry({ id: '9', moduleKey: 'moderation', path: 'moderation.logChannelId' })],
				nextCursor: null
			}
		});
		paint();

		await user.click(screen.getByRole('combobox'));
		await user.click(screen.getByRole('option', { name: 'Moderation' }));

		await waitFor(() => {
			expect(screen.getByText('Log channel')).toBeInTheDocument();
		});
		expect(screen.queryByText('Welcome channel')).not.toBeInTheDocument();
	});

	it('says the read failed instead of showing an empty log', async () => {
		const user = userEvent.setup();
		readAudit.mockResolvedValue({ status: 'error', message: 'No dashboard access' });
		paint([entry()], '1787997840000.42');

		await user.click(screen.getByRole('button', { name: 'Load older entries' }));

		await waitFor(() => {
			expect(toastError).toHaveBeenCalled();
		});
		expect(screen.getByText('Welcome channel')).toBeInTheDocument();
	});

	it('offers nothing to export when the log is empty', () => {
		paint([]);

		expect(screen.getByRole('button', { name: /Export/ })).toBeDisabled();
	});
});
