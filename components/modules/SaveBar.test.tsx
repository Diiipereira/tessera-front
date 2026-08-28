import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createTranslator } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';
import enUS from '@/messages/en-US.json';
import { Translated } from '@/tests/i18n';
import { SaveBar } from './SaveBar';

const copy = enUS.modules.save;

const t = createTranslator({ locale: 'en-US', messages: enUS, namespace: 'modules.save' });

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
	render(<SaveBar {...props} />, { wrapper: Translated });
	return props;
}

describe('SaveBar', () => {
	it('stays out of the way while the form is clean', () => {
		setup({ dirty: false, changedCount: 0 });
		expect(screen.queryByRole('region', { name: copy.region })).not.toBeInTheDocument();
	});

	it('appears as soon as something is dirty', () => {
		setup();
		expect(screen.getByRole('region', { name: copy.region })).toBeInTheDocument();
		expect(screen.getByText(copy.unsaved)).toBeInTheDocument();
	});

	it('says how many settings changed', () => {
		setup({ changedCount: 3 });
		expect(screen.getByText(t('modified', { count: 3 }))).toBeInTheDocument();
	});

	it('counts one change differently from many, in whatever language is loaded', () => {
		setup({ changedCount: 1 });

		const one = t('modified', { count: 1 });

		expect(screen.getByText(one)).toBeInTheDocument();
		expect(one).not.toBe(t('modified', { count: 3 }));
	});

	it('calls onSave', async () => {
		const user = userEvent.setup();
		const props = setup();

		await user.click(screen.getByRole('button', { name: copy.submit }));
		expect(props.onSave).toHaveBeenCalledOnce();
	});

	it('calls onDiscard', async () => {
		const user = userEvent.setup();
		const props = setup();

		await user.click(screen.getByRole('button', { name: copy.discard }));
		expect(props.onDiscard).toHaveBeenCalledOnce();
	});

	it('locks both buttons while saving', async () => {
		const user = userEvent.setup();
		const props = setup({ state: 'saving' });

		const save = screen.getByRole('button', { name: copy.saving });
		expect(save).toBeDisabled();
		expect(screen.getByRole('button', { name: copy.discard })).toBeDisabled();

		await user.click(save);
		expect(props.onSave).not.toHaveBeenCalled();
	});

	it('switches to the conflict wording when Discord won the race', () => {
		setup({ state: 'conflict' });

		expect(screen.getByText(copy.conflictTitle)).toBeInTheDocument();
		expect(screen.queryByText(copy.unsaved)).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: copy.submit })).not.toBeInTheDocument();
	});

	it('offers both ways out of a conflict', async () => {
		const user = userEvent.setup();
		const props = setup({ state: 'conflict' });

		await user.click(screen.getByRole('button', { name: copy.reload }));
		expect(props.onResolveConflict).toHaveBeenCalledWith('reload');

		await user.click(screen.getByRole('button', { name: copy.keepMine }));
		expect(props.onResolveConflict).toHaveBeenCalledWith('keep-mine');
	});

	it('shows a conflict even when nothing local is dirty', () => {
		setup({ dirty: false, changedCount: 0, state: 'conflict' });
		expect(screen.getByText(copy.conflictTitle)).toBeInTheDocument();
	});
});
