import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { mockAccountPreferences, mockAccountSessions, mockGuilds, mockUser } from '@/lib/mock';
import { AccountPanel } from './AccountPanel';

function renderPanel() {
	return render(
		<ThemeProvider>
			<AccountPanel
				open
				onOpenChange={() => undefined}
				returnFocusTo={createRef<HTMLElement>()}
				user={mockUser}
				preferences={mockAccountPreferences}
				sessions={mockAccountSessions}
				guilds={mockGuilds}
			/>
		</ThemeProvider>
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
});
