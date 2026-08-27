import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from './ConfirmDialog';

function renderDialog(onConfirm = vi.fn(), onOpenChange = vi.fn()) {
	render(
		<ConfirmDialog
			open
			onOpenChange={onOpenChange}
			title="Remove the bot?"
			description="It leaves immediately."
			confirmPhrase="Pixel Foundry"
			confirmLabel="Remove the bot"
			onConfirm={onConfirm}
		/>
	);
	return { onConfirm, onOpenChange };
}

describe('ConfirmDialog', () => {
	it('keeps the destructive action out of reach until the phrase is typed', () => {
		renderDialog();
		expect(screen.getByRole('button', { name: 'Remove the bot' })).toBeDisabled();
	});

	it('unlocks on an exact match', async () => {
		const user = userEvent.setup();
		renderDialog();

		await user.type(screen.getByLabelText(/Type Pixel Foundry/), 'Pixel Foundry');

		expect(screen.getByRole('button', { name: 'Remove the bot' })).toBeEnabled();
	});

	it('stays locked when the capitals are wrong', async () => {
		const user = userEvent.setup();
		renderDialog();

		await user.type(screen.getByLabelText(/Type Pixel Foundry/), 'pixel foundry');

		expect(screen.getByRole('button', { name: 'Remove the bot' })).toBeDisabled();
	});

	it('ignores surrounding whitespace, which is what pasting produces', async () => {
		const user = userEvent.setup();
		renderDialog();

		await user.type(screen.getByLabelText(/Type Pixel Foundry/), '  Pixel Foundry  ');

		expect(screen.getByRole('button', { name: 'Remove the bot' })).toBeEnabled();
	});

	it('runs the action and closes once confirmed', async () => {
		const user = userEvent.setup();
		const { onConfirm, onOpenChange } = renderDialog();

		await user.type(screen.getByLabelText(/Type Pixel Foundry/), 'Pixel Foundry');
		await user.click(screen.getByRole('button', { name: 'Remove the bot' }));

		expect(onConfirm).toHaveBeenCalledOnce();
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it('closes without running anything on cancel', async () => {
		const user = userEvent.setup();
		const { onConfirm, onOpenChange } = renderDialog();

		await user.click(screen.getByRole('button', { name: 'Cancel' }));

		expect(onConfirm).not.toHaveBeenCalled();
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});
});
