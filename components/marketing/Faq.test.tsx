import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { BRAND } from '@/lib/brand';
import { FAQ_ENTRIES } from '@/lib/marketing';
import messages from '@/messages/en-US.json';
import { Translated } from '@/tests/i18n';
import { Faq } from './Faq';

const answer = (key: 'free' | 'administrator' | 'slash' | 'export'): string =>
	messages.marketing.faq[key].answer.replaceAll('{brand}', BRAND.name);

const copy = messages.marketing.faq;

const [first, second] = FAQ_ENTRIES;

function renderFaq() {
	render(
		<Translated>
			<Faq />
		</Translated>
	);
}

describe('Faq', () => {
	it('opens the first question so the section is never a wall of closed rows', () => {
		renderFaq();

		expect(screen.getByRole('button', { name: copy[first].question })).toHaveAttribute(
			'aria-expanded',
			'true'
		);
		expect(screen.getByText(answer(first))).toBeInTheDocument();
		expect(screen.queryByText(answer(second))).not.toBeInTheDocument();
	});

	it('closes the open one when another is opened', async () => {
		const user = userEvent.setup();
		renderFaq();

		await user.click(screen.getByRole('button', { name: copy[second].question }));

		expect(screen.getByText(answer(second))).toBeInTheDocument();
		expect(screen.queryByText(answer(first))).not.toBeInTheDocument();
	});

	it('collapses the open one when it is clicked again', async () => {
		const user = userEvent.setup();
		renderFaq();

		await user.click(screen.getByRole('button', { name: copy[first].question }));

		expect(screen.getByRole('button', { name: copy[first].question })).toHaveAttribute(
			'aria-expanded',
			'false'
		);
		expect(screen.queryByText(answer(first))).not.toBeInTheDocument();
	});
});
