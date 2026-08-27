import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { FAQ_ENTRIES } from '@/lib/marketing';
import { Faq } from './Faq';

const first = FAQ_ENTRIES[0];
const second = FAQ_ENTRIES[1];

if (!first || !second) throw new Error('FAQ_ENTRIES precisa de pelo menos duas perguntas');

describe('Faq', () => {
	it('opens the first question so the section is never a wall of closed rows', () => {
		render(<Faq />);

		expect(screen.getByRole('button', { name: first.question })).toHaveAttribute(
			'aria-expanded',
			'true'
		);
		expect(screen.getByText(first.answer)).toBeInTheDocument();
		expect(screen.queryByText(second.answer)).not.toBeInTheDocument();
	});

	it('closes the open one when another is opened', async () => {
		const user = userEvent.setup();
		render(<Faq />);

		await user.click(screen.getByRole('button', { name: second.question }));

		expect(screen.getByText(second.answer)).toBeInTheDocument();
		expect(screen.queryByText(first.answer)).not.toBeInTheDocument();
	});

	it('collapses the open one when it is clicked again', async () => {
		const user = userEvent.setup();
		render(<Faq />);

		await user.click(screen.getByRole('button', { name: first.question }));

		expect(screen.getByRole('button', { name: first.question })).toHaveAttribute(
			'aria-expanded',
			'false'
		);
		expect(screen.queryByText(first.answer)).not.toBeInTheDocument();
	});
});
