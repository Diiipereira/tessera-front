import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mockAudit } from '@/lib/mock';
import { AuditScreen } from './AuditScreen';

function renderScreen() {
	return render(<AuditScreen entries={mockAudit} />);
}

function rowFor(name: string | RegExp) {
	return screen.getByRole('button', { name }).closest('li') as HTMLElement;
}

describe('AuditScreen', () => {
	it('lists every retained entry', () => {
		renderScreen();
		expect(
			screen.getByText(
				`Showing ${String(mockAudit.length)} of ${String(mockAudit.length)} retained entries.`
			)
		).toBeInTheDocument();
	});

	it('keeps every diff collapsed until a row is opened', () => {
		renderScreen();
		expect(screen.queryByRole('columnheader', { name: 'Before' })).not.toBeInTheDocument();
	});

	it('opens a before/after diff on the row it was asked for', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.click(screen.getByRole('button', { name: /Changed AutoMod rule/ }));

		const row = rowFor(/Changed AutoMod rule/);
		expect(within(row).getByRole('columnheader', { name: 'Before' })).toBeInTheDocument();
		expect(within(row).getByText('Exempt role ids')).toBeInTheDocument();
		expect(within(row).getByText('(empty list)')).toBeInTheDocument();
	});

	it('leaves out the fields that did not move', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.click(screen.getByRole('button', { name: /Changed AutoMod rule/ }));

		const row = rowFor(/Changed AutoMod rule/);
		expect(within(row).queryByText('Threshold')).not.toBeInTheDocument();
	});

	it('closes the open row when another is opened', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.click(screen.getByRole('button', { name: /Changed AutoMod rule/ }));
		await user.click(screen.getByRole('button', { name: /Enabled the Levels module/ }));

		expect(screen.getByRole('button', { name: /Changed AutoMod rule/ })).toHaveAttribute(
			'aria-expanded',
			'false'
		);
		expect(screen.getByRole('button', { name: /Enabled the Levels module/ })).toHaveAttribute(
			'aria-expanded',
			'true'
		);
	});

	it('narrows to one source', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.click(screen.getByRole('button', { name: 'API' }));

		expect(screen.getByRole('button', { name: /Synced 24 slash commands/ })).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: /Changed AutoMod rule/ })).not.toBeInTheDocument();
	});

	it('searches a field name, not only the action sentence', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.type(screen.getByLabelText('Search the audit log'), 'streak');

		expect(screen.getByRole('button', { name: /economy daily reward/ })).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: /Changed AutoMod rule/ })).not.toBeInTheDocument();
	});

	it('offers a way back when nothing matches', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.type(screen.getByLabelText('Search the audit log'), 'zzzzz');

		expect(screen.getByRole('heading', { name: 'Nothing matches' })).toBeInTheDocument();
	});
});
