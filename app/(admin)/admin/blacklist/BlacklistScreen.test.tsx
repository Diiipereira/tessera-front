import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mockBlacklist } from '@/lib/mock/admin';
import { BlacklistScreen } from './BlacklistScreen';

describe('BlacklistScreen', () => {
	it('hides expired blocks, which are history rather than policy', () => {
		render(<BlacklistScreen entries={mockBlacklist} />);

		expect(screen.queryByText('api-hammer')).not.toBeInTheDocument();
		expect(screen.getByText('raid-account-01')).toBeInTheDocument();
	});

	it('shows the expired ones when asked, marked as expired', async () => {
		const user = userEvent.setup();
		render(<BlacklistScreen entries={mockBlacklist} />);

		await user.click(screen.getByRole('checkbox', { name: /Show expired/ }));

		expect(screen.getByText('api-hammer')).toBeInTheDocument();
		expect(screen.getByText('Expired')).toBeInTheDocument();
	});

	it('narrows to servers when the target filter is switched', async () => {
		const user = userEvent.setup();
		render(<BlacklistScreen entries={mockBlacklist} />);

		await user.click(screen.getByRole('button', { name: 'Servers' }));

		expect(screen.getByText('Free Nitro Zone')).toBeInTheDocument();
		expect(screen.queryByText('raid-account-01')).not.toBeInTheDocument();
	});

	it('searches the reason, not only the name', async () => {
		const user = userEvent.setup();
		render(<BlacklistScreen entries={mockBlacklist} />);

		await user.type(screen.getByLabelText('Search the blacklist'), 'phishing');

		expect(screen.getByText('Free Nitro Zone')).toBeInTheDocument();
		expect(screen.queryByText('raid-account-01')).not.toBeInTheDocument();
	});

	it('keeps the block button out of reach until the id is a real snowflake', async () => {
		const user = userEvent.setup();
		render(<BlacklistScreen entries={mockBlacklist} />);

		await user.click(screen.getByRole('button', { name: /Add entry/ }));

		const confirm = screen.getByRole('button', { name: 'Blacklist' });
		expect(confirm).toBeDisabled();

		await user.type(screen.getByLabelText('Target id'), '1234');
		expect(confirm).toBeDisabled();
		expect(screen.getByText('A snowflake is 17 to 20 digits.')).toBeInTheDocument();
	});

	it('unlocks once the id has the right shape', async () => {
		const user = userEvent.setup();
		render(<BlacklistScreen entries={mockBlacklist} />);

		await user.click(screen.getByRole('button', { name: /Add entry/ }));
		await user.type(screen.getByLabelText('Target id'), '123456789012345678');

		expect(screen.getByRole('button', { name: 'Blacklist' })).toBeEnabled();
	});
});
