import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { EscalationRule } from '@/lib/types/modules';
import { EscalationTable } from './EscalationTable';

function Stateful({ initial }: { initial: EscalationRule[] }) {
	const [rules, setRules] = useState(initial);
	return <EscalationTable rules={rules} onChange={setRules} />;
}

const rules: EscalationRule[] = [
	{ id: 'e2', atWarnings: 5, action: 'mute', duration: '24h' },
	{ id: 'e1', atWarnings: 3, action: 'timeout', duration: '1h' },
	{ id: 'e3', atWarnings: 7, action: 'ban', duration: 'permanent' }
];

function warningInputs() {
	return screen
		.getAllByLabelText('Warnings before this rule fires')
		.map((input) => (input as HTMLInputElement).value);
}

describe('EscalationTable', () => {
	it('lists rules by warning count, whatever order they arrive in', () => {
		render(<EscalationTable rules={rules} onChange={vi.fn()} />);
		expect(warningInputs()).toEqual(['3', '5', '7']);
	});

	it('says so plainly when there is no escalation', () => {
		render(<EscalationTable rules={[]} onChange={vi.fn()} />);
		expect(screen.getByText(/No escalation yet/)).toBeInTheDocument();
	});

	it('adds a rule above the current highest so it does not collide', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(<EscalationTable rules={rules} onChange={onChange} />);

		await user.click(screen.getByRole('button', { name: /Add rule/ }));

		const next = onChange.mock.calls[0]?.[0] as EscalationRule[];
		expect(next).toHaveLength(4);
		expect(next.at(-1)?.atWarnings).toBeGreaterThan(7);
	});

	it('removes the rule the button belongs to', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(<EscalationTable rules={rules} onChange={onChange} />);

		await user.click(screen.getByRole('button', { name: 'Remove the rule at 5 warnings' }));

		const next = onChange.mock.calls[0]?.[0] as EscalationRule[];
		expect(next.map((rule) => rule.id)).toEqual(['e1', 'e3']);
	});

	it('warns when two rules fire at the same warning count', () => {
		render(
			<EscalationTable
				rules={[
					{ id: 'a', atWarnings: 3, action: 'timeout', duration: '1h' },
					{ id: 'b', atWarnings: 3, action: 'kick', duration: '1h' }
				]}
				onChange={vi.fn()}
			/>
		);
		expect(screen.getByText(/Only the first will run/)).toBeInTheDocument();
	});

	it('stays quiet when every rule has its own count', () => {
		render(<EscalationTable rules={rules} onChange={vi.fn()} />);
		expect(screen.queryByText(/Only the first will run/)).not.toBeInTheDocument();
	});

	it('offers no duration for an action that has none', () => {
		render(
			<EscalationTable
				rules={[{ id: 'k', atWarnings: 4, action: 'kick', duration: '1h' }]}
				onChange={vi.fn()}
			/>
		);

		const row = screen.getAllByRole('row')[1];
		expect(row).toBeDefined();
		expect(within(row as HTMLElement).getByText('Not applicable')).toBeInTheDocument();
	});

	it('keeps the duration control for actions that do have one', () => {
		render(
			<EscalationTable
				rules={[{ id: 't', atWarnings: 4, action: 'timeout', duration: '1h' }]}
				onChange={vi.fn()}
			/>
		);

		const row = screen.getAllByRole('row')[1];
		expect(row).toBeDefined();
		expect(within(row as HTMLElement).queryByText('Not applicable')).not.toBeInTheDocument();
	});

	it('reports an edited warning count', async () => {
		const user = userEvent.setup();
		render(<Stateful initial={[{ id: 'a', atWarnings: 3, action: 'timeout', duration: '1h' }]} />);

		const input = screen.getByLabelText('Warnings before this rule fires');
		await user.clear(input);
		await user.type(input, '9');

		expect(input).toHaveValue(9);
	});

	it('survives being cleared and retyped with a two-digit number', async () => {
		const user = userEvent.setup();
		render(<Stateful initial={[{ id: 'a', atWarnings: 3, action: 'timeout', duration: '1h' }]} />);

		const input = screen.getByLabelText('Warnings before this rule fires');
		await user.clear(input);
		await user.type(input, '12');

		expect(input).toHaveValue(12);
	});

	it('clamps a value typed above the maximum', async () => {
		const user = userEvent.setup();
		render(<Stateful initial={[{ id: 'a', atWarnings: 3, action: 'timeout', duration: '1h' }]} />);

		const input = screen.getByLabelText('Warnings before this rule fires');
		await user.clear(input);
		await user.type(input, '250');
		await user.tab();

		expect(input).toHaveValue(99);
	});

	it('falls back to the previous value when left empty', async () => {
		const user = userEvent.setup();
		render(<Stateful initial={[{ id: 'a', atWarnings: 3, action: 'timeout', duration: '1h' }]} />);

		const input = screen.getByLabelText('Warnings before this rule fires');
		await user.clear(input);
		await user.tab();

		expect(input).toHaveValue(3);
	});
});
