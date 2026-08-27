import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mockMembers, mockRoles } from '@/lib/mock';
import { MembersScreen } from './MembersScreen';

function renderScreen() {
	return render(
		<MembersScreen members={mockMembers} roles={mockRoles} memberCount={12431} currency="Shards" />
	);
}

describe('MembersScreen', () => {
	it('lists every loaded member', () => {
		renderScreen();
		expect(
			screen.getByText(
				`Showing ${String(mockMembers.length)} of ${String(mockMembers.length)} loaded members.`
			)
		).toBeInTheDocument();
	});

	it('names the balance column after the configured currency', () => {
		renderScreen();
		expect(screen.getByRole('columnheader', { name: 'Shards' })).toBeInTheDocument();
	});

	it('finds a member by a fragment of their ID', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.type(screen.getByLabelText('Search members'), '61726');

		expect(screen.getByRole('button', { name: 'Open ruido' })).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Open lia' })).not.toBeInTheDocument();
	});

	it('says so plainly when nobody matches', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.type(screen.getByLabelText('Search members'), 'zzzzz');

		expect(screen.getByRole('heading', { name: 'Nobody matches' })).toBeInTheDocument();
	});

	it('opens the drawer for the row that was clicked', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.click(screen.getByRole('button', { name: 'Open tigre' }));

		const drawer = screen.getByRole('dialog');
		expect(within(drawer).getByText('@tigre.9')).toBeInTheDocument();
		expect(within(drawer).getByText('951607810293847563')).toBeInTheDocument();
	});

	it('shows the infractions on the tab that promises them', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.click(screen.getByRole('button', { name: 'Open tigre' }));

		const drawer = screen.getByRole('dialog');
		expect(within(drawer).queryByText('Kept going after the warning.')).not.toBeInTheDocument();

		await user.click(within(drawer).getByRole('button', { name: /Infractions/ }));

		expect(within(drawer).getByText('Kept going after the warning.')).toBeInTheDocument();
	});

	it('counts only warnings in the warnings stat, not every action', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.click(screen.getByRole('button', { name: 'Open ruido' }));

		const drawer = screen.getByRole('dialog');
		const warnings = within(drawer).getByText('Warnings').closest('div') as HTMLElement;
		expect(within(warnings).getByText('1')).toBeInTheDocument();
	});

	it('reopens on a different member without keeping the previous one', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.click(screen.getByRole('button', { name: 'Open tigre' }));
		await user.keyboard('{Escape}');
		await user.click(screen.getByRole('button', { name: 'Open lia' }));

		const drawer = screen.getByRole('dialog');
		expect(within(drawer).getByText('@lia.exe')).toBeInTheDocument();
		expect(within(drawer).queryByText('@tigre.9')).not.toBeInTheDocument();
	});
});
