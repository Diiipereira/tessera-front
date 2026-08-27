import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { NumberInput } from './NumberInput';

function Harness({ start = 5, min = 1, max = 10 }: { start?: number; min?: number; max?: number }) {
	const [value, setValue] = useState(start);
	return <NumberInput value={value} onValueChange={setValue} min={min} max={max} />;
}

function steppers(): HTMLButtonElement[] {
	return [...document.querySelectorAll<HTMLButtonElement>('[aria-hidden="true"] button')];
}

describe('NumberInput', () => {
	it('hides the steppers from assistive tech and from the tab order', () => {
		render(<Harness />);

		const [up, down] = steppers();
		expect(up?.tabIndex).toBe(-1);
		expect(down?.tabIndex).toBe(-1);
		expect(screen.queryAllByRole('button')).toHaveLength(0);
		expect(screen.getByRole('spinbutton')).toHaveValue(5);
	});

	it('steps up and down one at a time', async () => {
		const user = userEvent.setup();
		render(<Harness />);

		const [up, down] = steppers();
		if (!up || !down) throw new Error('steppers ausentes');

		await user.click(up);
		expect(screen.getByRole('spinbutton')).toHaveValue(6);

		await user.click(up);
		expect(screen.getByRole('spinbutton')).toHaveValue(7);

		await user.click(down);
		expect(screen.getByRole('spinbutton')).toHaveValue(6);
	});

	it('disables the end of the range it is already sitting on', async () => {
		const user = userEvent.setup();
		render(<Harness start={9} min={1} max={10} />);

		const [up, down] = steppers();
		if (!up || !down) throw new Error('steppers ausentes');
		expect(up).not.toBeDisabled();

		await user.click(up);

		expect(screen.getByRole('spinbutton')).toHaveValue(10);
		expect(steppers()[0]).toBeDisabled();
		expect(steppers()[1]).not.toBeDisabled();
	});

	it('never steps past the range even from a typed value', async () => {
		const user = userEvent.setup();
		render(<Harness start={5} min={1} max={10} />);

		const field = screen.getByRole('spinbutton');
		await user.clear(field);
		await user.type(field, '10');

		const [up] = steppers();
		if (!up) throw new Error('stepper ausente');
		expect(up).toBeDisabled();
	});
});
