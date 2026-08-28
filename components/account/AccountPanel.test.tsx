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

const success = vi.fn();

vi.mock('next/navigation', () => ({
	useRouter: () => ({ refresh: () => undefined })
}));

vi.mock('sonner', () => ({
	toast: {
		success: (...args: unknown[]) => success(...args) as unknown,
		error: () => undefined
	}
}));

beforeEach(() => {
	success.mockClear();
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
					preferences={{ ...mockAccountPreferences, locale }}
					sessions={mockAccountSessions}
					guilds={mockGuilds}
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

	it('shows the language the app is actually rendering in, not a hardcoded default', async () => {
		const user = userEvent.setup();
		renderPanel('pt-BR');

		await user.click(tab(ptBR.account.tabs.interface));

		expect(
			screen.getByRole('combobox', { name: ptBR.account.interface.language })
		).toHaveTextContent(ptBR.locales['pt-BR']);
	});

	async function switchLanguageTo(from: SupportedLocale, target: string): Promise<unknown> {
		const user = userEvent.setup();
		const copy = from === 'pt-BR' ? ptBR : enUS;

		renderPanel(from);

		await user.click(tab(copy.account.tabs.interface));
		await user.click(screen.getByRole('combobox', { name: copy.account.interface.language }));
		await user.click(await screen.findByRole('option', { name: target }));
		await user.click(screen.getByRole('button', { name: copy.modules.save.submit }));

		await waitFor(() => {
			expect(success).toHaveBeenCalled();
		});

		return success.mock.calls.at(-1)?.[0];
	}

	it('confirms in the language being switched to, not the one being left', async () => {
		const said = await switchLanguageTo('en-US', ptBR.locales['pt-BR']);

		expect(said).toBe(ptBR.account.saved);
		expect(said).not.toBe(enUS.account.saved);
	});

	it('confirms in English when English is the one being switched to', async () => {
		const said = await switchLanguageTo('pt-BR', enUS.locales['en-US']);

		expect(said).toBe(enUS.account.saved);
		expect(said).not.toBe(ptBR.account.saved);
	});

	it('keeps the current language when the save changed something else', async () => {
		const user = userEvent.setup();
		renderPanel('pt-BR');

		await user.click(tab(ptBR.account.tabs.email));
		await user.click(screen.getAllByRole('switch')[0] as HTMLElement);
		await user.click(screen.getByRole('button', { name: ptBR.modules.save.submit }));

		await waitFor(() => {
			expect(success).toHaveBeenCalledWith(ptBR.account.saved);
		});
	});
});
