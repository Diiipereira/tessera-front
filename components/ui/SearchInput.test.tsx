import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { SearchInput } from './SearchInput';

function Harness({ start = '' }: { start?: string }) {
	const [value, setValue] = useState(start);
	return <SearchInput value={value} onValueChange={setValue} aria-label="Search members" />;
}

function clearButton(): HTMLButtonElement {
	return screen.getByRole('button', { name: 'Clear search' });
}

describe('SearchInput', () => {
	it('keeps the clear button out of reach while the field is empty', () => {
		render(<Harness />);

		expect(clearButton()).toHaveClass('invisible');
	});

	it('shows the clear button once there is something to clear', async () => {
		const user = userEvent.setup();
		render(<Harness />);

		await user.type(screen.getByRole('searchbox'), 'mora');

		expect(clearButton()).not.toHaveClass('invisible');
	});

	it('clears the query and hands focus back to the field', async () => {
		const user = userEvent.setup();
		render(<Harness start="mora" />);

		await user.click(clearButton());

		const field = screen.getByRole('searchbox');
		expect(field).toHaveValue('');
		expect(field).toHaveFocus();
	});

	it('clears on Escape', async () => {
		const user = userEvent.setup();
		render(<Harness start="mora" />);

		const field = screen.getByRole('searchbox');
		field.focus();
		await user.keyboard('{Escape}');

		expect(field).toHaveValue('');
	});
});
