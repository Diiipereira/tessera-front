import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SaveBar } from './SaveBar';

function setup(overrides: Partial<Parameters<typeof SaveBar>[0]> = {}) {
	const props = {
		dirty: true,
		changedCount: 3,
		state: 'idle' as const,
		onDiscard: vi.fn(),
		onSave: vi.fn(),
		onResolveConflict: vi.fn(),
		...overrides
	};
	render(<SaveBar {...props} />);
	return props;
}

describe('SaveBar', () => {
	it('stays out of the way while the form is clean', () => {
		setup({ dirty: false, changedCount: 0 });
		expect(screen.queryByRole('region', { name: 'Unsaved changes' })).not.toBeInTheDocument();
	});

	it('appears as soon as something is dirty', () => {
		setup();
		expect(screen.getByRole('region', { name: 'Unsaved changes' })).toBeInTheDocument();
		expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
	});

	it('says how many settings changed', () => {
		setup({ changedCount: 3 });
		expect(screen.getByText('3 settings modified')).toBeInTheDocument();
	});

	it('says "setting", singular, when only one changed', () => {
		setup({ changedCount: 1 });
		expect(screen.getByText('1 setting modified')).toBeInTheDocument();
	});

	it('calls onSave', async () => {
		const user = userEvent.setup();
		const props = setup();

		await user.click(screen.getByRole('button', { name: 'Save changes' }));
		expect(props.onSave).toHaveBeenCalledOnce();
	});

	it('calls onDiscard', async () => {
		const user = userEvent.setup();
		const props = setup();

		await user.click(screen.getByRole('button', { name: /Discard/ }));
		expect(props.onDiscard).toHaveBeenCalledOnce();
	});

	it('locks both buttons while saving', async () => {
		const user = userEvent.setup();
		const props = setup({ state: 'saving' });

		const save = screen.getByRole('button', { name: /Saving/ });
		expect(save).toBeDisabled();
		expect(screen.getByRole('button', { name: /Discard/ })).toBeDisabled();

		await user.click(save);
		expect(props.onSave).not.toHaveBeenCalled();
	});

	it('switches to the conflict wording when Discord won the race', () => {
		setup({ state: 'conflict' });

		expect(screen.getByText('This was changed in Discord')).toBeInTheDocument();
		expect(screen.queryByText('You have unsaved changes')).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument();
	});

	it('offers both ways out of a conflict', async () => {
		const user = userEvent.setup();
		const props = setup({ state: 'conflict' });

		await user.click(screen.getByRole('button', { name: 'Reload' }));
		expect(props.onResolveConflict).toHaveBeenCalledWith('reload');

		await user.click(screen.getByRole('button', { name: 'Keep mine' }));
		expect(props.onResolveConflict).toHaveBeenCalledWith('keep-mine');
	});

	it('shows a conflict even when nothing local is dirty', () => {
		setup({ dirty: false, changedCount: 0, state: 'conflict' });
		expect(screen.getByText('This was changed in Discord')).toBeInTheDocument();
	});
});
