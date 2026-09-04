import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { mockAccountPreferences, mockAccountSessions, mockGuilds, mockUser } from '@/lib/mock';
import type { SupportedLocale } from '@/lib/locale';
import enUS from '@/messages/en-US.json';
import ptBR from '@/messages/pt-BR.json';
import { Translated } from '@/tests/i18n';
import { AccountPanel } from './AccountPanel';

const NOW = '2026-08-25T18:30:00.000Z';

const success = vi.fn();
const failure = vi.fn();

const revokeSession = vi.hoisted(() => vi.fn());
const revokeOtherSessions = vi.hoisted(() => vi.fn());

vi.mock('@/lib/account-client', () => ({ revokeSession, revokeOtherSessions }));

vi.mock('next/navigation', () => ({
	useRouter: () => ({ refresh: () => undefined })
}));

vi.mock('sonner', () => ({
	toast: {
		success: (...args: unknown[]) => success(...args) as unknown,
		error: (...args: unknown[]) => failure(...args) as unknown
	}
}));

beforeEach(() => {
	success.mockClear();
	failure.mockClear();
	revokeSession.mockReset();
	revokeOtherSessions.mockReset();
	revokeSession.mockResolvedValue({ status: 'revoked' });
	revokeOtherSessions.mockResolvedValue({ status: 'revoked' });
});

function renderPanel(locale: SupportedLocale = 'en-US') {
	return render(
		<Translated locale={locale}>
			<ThemeProvider>
				<AccountPanel
					open
					onOpenChange={() => undefined}
					returnFocusTo={createRef<HTMLElement>()}
					user={mockUser}
					preferences={mockAccountPreferences}
					sessions={mockAccountSessions}
					guilds={mockGuilds}
					now={NOW}
				/>
			</ThemeProvider>
		</Translated>
	);
}

function tab(name: string) {
	return screen.getByRole('tab', { name });
}

describe('AccountPanel', () => {
	it('opens on Profile with every section reachable from the rail', () => {
		renderPanel();

		expect(screen.getAllByRole('tab').map((entry) => entry.textContent)).toEqual([
			'Profile',
			'Interface',
			'Email',
			'Servers',
			'Sessions',
			'Your data'
		]);
		expect(tab('Profile')).toHaveAttribute('aria-selected', 'true');
		expect(screen.getByRole('heading', { name: 'Profile', level: 2 })).toBeInTheDocument();
	});

	it('shows one section at a time', async () => {
		const user = userEvent.setup();
		renderPanel();

		await user.click(tab('Sessions'));

		expect(screen.getByRole('heading', { name: 'Active sessions', level: 2 })).toBeInTheDocument();
		expect(screen.queryByRole('heading', { name: 'Profile', level: 2 })).not.toBeInTheDocument();
	});

	it('keeps a single tab stop and moves the selection with the arrow keys', async () => {
		const user = userEvent.setup();
		renderPanel();

		tab('Profile').focus();
		await user.keyboard('{ArrowDown}{ArrowDown}');

		expect(tab('Email')).toHaveFocus();
		expect(tab('Email')).toHaveAttribute('aria-selected', 'true');
		expect(screen.getAllByRole('tab').filter((entry) => entry.tabIndex === 0)).toHaveLength(1);
	});

	it('wraps around the rail and jumps to the ends', async () => {
		const user = userEvent.setup();
		renderPanel();

		tab('Profile').focus();
		await user.keyboard('{ArrowUp}');
		expect(tab('Your data')).toHaveAttribute('aria-selected', 'true');

		await user.keyboard('{Home}');
		expect(tab('Profile')).toHaveAttribute('aria-selected', 'true');
	});

	it('raises the save bar for a change made in any section', async () => {
		const user = userEvent.setup();
		renderPanel();

		expect(screen.queryByRole('region', { name: 'Unsaved changes' })).not.toBeInTheDocument();

		await user.click(tab('Email'));
		await user.click(
			screen.getByRole('switch', { name: 'When a case I opened is edited or revoked' })
		);

		expect(screen.getByRole('region', { name: 'Unsaved changes' })).toBeInTheDocument();
	});

	it('confirms a save in the language the panel is showing', async () => {
		const user = userEvent.setup();
		renderPanel('pt-BR');

		await user.click(tab(ptBR.account.tabs.email));
		await user.click(screen.getAllByRole('switch')[0] as HTMLElement);
		await user.click(screen.getByRole('button', { name: ptBR.modules.save.submit }));

		await waitFor(() => {
			expect(success).toHaveBeenCalledWith(ptBR.account.saved);
		});
	});

	describe('sessions', () => {
		const openSessions = async () => {
			const user = userEvent.setup();
			renderPanel();

			await user.click(tab(enUS.account.tabs.sessions));

			return user;
		};

		it('drops a session from the list only after the API took it', async () => {
			const user = await openSessions();
			const before = screen.getAllByRole('button', { name: enUS.account.sessions.revoke });

			await user.click(before[0] as HTMLElement);

			await waitFor(() => {
				expect(revokeSession).toHaveBeenCalledWith(mockAccountSessions[1]?.id);
			});
			expect(screen.getAllByRole('button', { name: enUS.account.sessions.revoke })).toHaveLength(
				before.length - 1
			);
		});

		it('keeps the session on screen when the API refused', async () => {
			revokeSession.mockResolvedValue({ status: 'error', message: 'The API answered 500' });

			const user = await openSessions();
			const before = screen.getAllByRole('button', { name: enUS.account.sessions.revoke });

			await user.click(before[0] as HTMLElement);

			await waitFor(() => {
				expect(failure).toHaveBeenCalledWith(enUS.account.sessions.revokeFailed, {
					description: 'The API answered 500'
				});
			});
			expect(screen.getAllByRole('button', { name: enUS.account.sessions.revoke })).toHaveLength(
				before.length
			);
		});

		it('signs the other devices out and leaves this one standing', async () => {
			const user = await openSessions();

			await user.click(screen.getByRole('button', { name: enUS.account.sessions.signOutOthers }));

			await waitFor(() => {
				expect(revokeOtherSessions).toHaveBeenCalled();
			});
			expect(screen.queryAllByRole('button', { name: enUS.account.sessions.revoke })).toHaveLength(
				0
			);
			expect(screen.getByText(enUS.account.sessions.thisDevice)).toBeInTheDocument();
		});

		it('never offers to sign out others when this is the only session', async () => {
			const user = userEvent.setup();

			render(
				<Translated>
					<ThemeProvider>
						<AccountPanel
							open
							onOpenChange={() => undefined}
							returnFocusTo={createRef<HTMLElement>()}
							user={mockUser}
							preferences={mockAccountPreferences}
							sessions={[mockAccountSessions[0] as (typeof mockAccountSessions)[number]]}
							guilds={mockGuilds}
							now={NOW}
						/>
					</ThemeProvider>
				</Translated>
			);

			await user.click(tab(enUS.account.tabs.sessions));

			expect(
				screen.getByRole('button', { name: enUS.account.sessions.signOutOthers })
			).toBeDisabled();
		});
	});
});
