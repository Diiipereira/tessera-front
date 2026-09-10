import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Translated } from '@/tests/i18n';
import { Select } from './Select';

const options = Array.from({ length: 15 }, (_, index) => ({
	value: `event-${String(index)}`,
	label: `Event ${String(index)}`
}));

const openIt = async (): Promise<HTMLElement> => {
	await userEvent.click(screen.getByRole('combobox'));

	return screen.getByRole('listbox');
};

describe('Select', () => {
	it('scrolls the list with a scrollbar, not with a pair of arrows', async () => {
		render(<Select options={options} placeholder="Pick one" />, { wrapper: Translated });

		const listbox = await openIt();
		const viewport = listbox.querySelector('[data-radix-select-viewport]');

		expect(viewport).not.toBeNull();
		expect(viewport).toHaveClass('thin-scroll');
		expect(listbox.querySelectorAll('svg.lucide-chevron-up')).toHaveLength(0);
		expect(listbox.querySelectorAll('svg.lucide-chevron-down')).toHaveLength(0);
	});

	it('keeps the flex sizing the viewport needs to be the part that scrolls', async () => {
		render(<Select options={options} placeholder="Pick one" />, { wrapper: Translated });

		const listbox = await openIt();

		expect(listbox).toHaveClass('flex', 'flex-col', 'overflow-hidden');
		expect(listbox.querySelector('[data-radix-select-viewport]')).toHaveClass('min-h-0');
	});
});
