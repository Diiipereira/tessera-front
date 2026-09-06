import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Role } from '@/lib/types/discord';
import { Translated } from '@/tests/i18n';
import { RolePicker } from './RolePicker';

const info = vi.hoisted(() => vi.fn());

vi.mock('sonner', () => ({ toast: { info: (...args: unknown[]) => info(...args) as unknown } }));

const ROLES: Role[] = [
	{ id: '1', name: 'verificado', color: '#57f287' },
	{ id: '2', name: 'teste-2', color: '#5865f2' },
	{ id: '3', name: 'teste-3', color: '#eb459e' }
];

async function open(value: string[], max?: number) {
	const user = userEvent.setup();
	const onValueChange = vi.fn();

	render(
		<Translated>
			<RolePicker roles={ROLES} value={value} max={max} onValueChange={onValueChange} />
		</Translated>
	);

	await user.click(screen.getAllByRole('button')[0] as HTMLElement);

	return { user, onValueChange };
}

const option = (name: string) => screen.getByRole('button', { name: new RegExp(name) });

describe('RolePicker limit', () => {
	it('counts what is chosen against the limit', async () => {
		await open(['1', '2'], 3);

		expect(screen.getByText('2 of 3 chosen')).toBeInTheDocument();
	});

	it('says nothing about a limit when there is none', async () => {
		await open(['1']);

		expect(screen.queryByText(/chosen/)).not.toBeInTheDocument();
	});

	it('refuses a role past the limit, and says why instead of doing nothing', async () => {
		const picker = await open(['1', '2'], 2);

		await picker.user.click(option('teste-3'));

		expect(picker.onValueChange).not.toHaveBeenCalled();
		expect(info).toHaveBeenCalled();
	});

	it('marks the roles it will not take, so the click is discouraged first', async () => {
		await open(['1', '2'], 2);

		expect(option('teste-3')).toHaveAttribute('aria-disabled', 'true');
		expect(option('verificado')).not.toHaveAttribute('aria-disabled');
	});

	it('still lets a chosen role be dropped at the limit, so the list can be swapped', async () => {
		const picker = await open(['1', '2'], 2);

		await picker.user.click(option('verificado'));

		expect(picker.onValueChange).toHaveBeenCalledWith(['2']);
	});

	it('takes a role while there is room', async () => {
		const picker = await open(['1'], 2);

		await picker.user.click(option('teste-2'));

		expect(picker.onValueChange).toHaveBeenCalledWith(['1', '2']);
	});
});
