import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Input } from './Input';

const DISCORD_ID = '393199508785201152';

describe('Input', () => {
	it('refuses edits to a read-only value', async () => {
		const user = userEvent.setup();
		render(<Input value={DISCORD_ID} readOnly aria-label="Discord ID" />);

		const field = screen.getByLabelText('Discord ID');

		await user.type(field, '999');

		expect(field).toHaveValue(DISCORD_ID);
	});

	it('keeps a read-only value reachable, since it exists to be copied', () => {
		render(<Input value={DISCORD_ID} readOnly aria-label="Discord ID" />);

		expect(screen.getByLabelText('Discord ID')).not.toBeDisabled();
	});

	it('drops the hover and focus emphasis that promises an edit', () => {
		render(<Input value={DISCORD_ID} readOnly aria-label="Discord ID" />);

		expect(screen.getByLabelText('Discord ID')).not.toHaveClass('focus:border-primary');
	});
});
