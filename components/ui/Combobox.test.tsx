import { render as rtlRender, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { Combobox, type ComboboxOption } from './Combobox';

import type { ReactElement } from 'react';
import { Translated } from '@/tests/i18n';

const render = (ui: ReactElement) => rtlRender(ui, { wrapper: Translated });

const OPTIONS: ComboboxOption[] = [
	{ value: 'America/Sao_Paulo', label: 'America/Sao Paulo (GMT-3)', search: 'america/sao_paulo' },
	{ value: 'Europe/Lisbon', label: 'Europe/Lisbon (GMT+1)', search: 'europe/lisbon' },
	{ value: 'Asia/Tokyo', label: 'Asia/Tokyo (GMT+9)', search: 'asia/tokyo' },
	{ value: 'UTC', label: 'UTC (GMT)', search: 'utc' }
];

function Harness({ start = 'UTC' }: { start?: string }) {
	const [value, setValue] = useState(start);

	return <Combobox options={OPTIONS} value={value} onValueChange={setValue} />;
}

const trigger = (): HTMLElement => screen.getByRole('combobox');

const search = (): HTMLElement => screen.getByRole('searchbox');

describe('Combobox', () => {
	it('shows the label of what is selected, not the raw value', () => {
		render(<Harness />);

		expect(trigger()).toHaveTextContent('UTC (GMT)');
	});

	it('opens on click and offers every option', async () => {
		const user = userEvent.setup();
		render(<Harness />);

		await user.click(trigger());

		expect(screen.getAllByRole('option')).toHaveLength(OPTIONS.length);
	});

	it('narrows the list as you type', async () => {
		const user = userEvent.setup();
		render(<Harness />);

		await user.click(trigger());
		await user.type(search(), 'tok');

		const options = screen.getAllByRole('option');

		expect(options).toHaveLength(1);
		expect(options[0]).toHaveTextContent('Asia/Tokyo');
	});

	it('matches the underscore spelling a label does not show', async () => {
		const user = userEvent.setup();
		render(<Harness />);

		await user.click(trigger());
		await user.type(search(), 'sao_paulo');

		expect(screen.getAllByRole('option')).toHaveLength(1);
	});

	it('says so instead of showing an empty list', async () => {
		const user = userEvent.setup();
		render(<Harness />);

		await user.click(trigger());
		await user.type(search(), 'atlantis');

		expect(screen.queryAllByRole('option')).toHaveLength(0);
		expect(screen.getByText('Nothing matches that.')).toBeInTheDocument();
	});

	it('picks with the mouse and closes', async () => {
		const user = userEvent.setup();
		render(<Harness />);

		await user.click(trigger());
		await user.click(screen.getByRole('option', { name: /Tokyo/ }));

		expect(trigger()).toHaveTextContent('Asia/Tokyo (GMT+9)');
		expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
	});

	it('picks with the keyboard, so the mouse is never required', async () => {
		const user = userEvent.setup();
		render(<Harness />);

		await user.click(trigger());
		await user.type(search(), 'lis');
		await user.keyboard('{Enter}');

		expect(trigger()).toHaveTextContent('Europe/Lisbon (GMT+1)');
	});

	it('forgets the query between openings', async () => {
		const user = userEvent.setup();
		render(<Harness />);

		await user.click(trigger());
		await user.type(search(), 'tok');
		await user.keyboard('{Escape}');
		await user.click(trigger());

		expect(search()).toHaveValue('');
		expect(screen.getAllByRole('option')).toHaveLength(OPTIONS.length);
	});

	it('still shows a stored value the option list does not carry', () => {
		render(<Harness start="Factory" />);

		expect(trigger()).toHaveTextContent('Factory');
	});

	it('marks the current value as selected for a screen reader', async () => {
		const user = userEvent.setup();
		render(<Harness start="Asia/Tokyo" />);

		await user.click(trigger());

		expect(screen.getByRole('option', { name: /Tokyo/ })).toHaveAttribute('aria-selected', 'true');
	});
});
