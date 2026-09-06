import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { NavigationBlockerProvider } from '@/components/providers/NavigationBlocker';
import { useNavigationBlocked } from '@/components/providers/navigation-blocker-context';
import { useConfigDraft } from './useConfigDraft';

type Config = { channelId: string | null };

const initial: Config = { channelId: 'c1' };

function Watch() {
	return <span data-testid="blocked">{String(useNavigationBlocked())}</span>;
}

function Editor({ name }: { name: string }) {
	const form = useConfigDraft<Config>(initial);

	return (
		<>
			<button
				type="button"
				onClick={() => {
					form.set('channelId', 'c2');
				}}
			>
				edit {name}
			</button>
			<button type="button" onClick={form.discard}>
				discard {name}
			</button>
		</>
	);
}

function Host({ second = false }: { second?: boolean }) {
	const [open, setOpen] = useState(true);
	const [companion, setCompanion] = useState(second);

	return (
		<NavigationBlockerProvider>
			<Watch />
			<button
				type="button"
				onClick={() => {
					setOpen(false);
				}}
			>
				close
			</button>
			<button
				type="button"
				onClick={() => {
					setCompanion(false);
				}}
			>
				close companion
			</button>
			{open ? <Editor name="one" /> : null}
			{companion ? <Editor name="two" /> : null}
		</NavigationBlockerProvider>
	);
}

const blocked = () => screen.getByTestId('blocked').textContent;

describe('useConfigDraft and the navigation blocker', () => {
	it('holds the door while the draft is dirty and lets go when it is discarded', async () => {
		const user = userEvent.setup();
		render(<Host />);

		expect(blocked()).toBe('false');

		await user.click(screen.getByRole('button', { name: 'edit one' }));

		expect(blocked()).toBe('true');

		await user.click(screen.getByRole('button', { name: 'discard one' }));

		expect(blocked()).toBe('false');
	});

	it('lets go when the screen goes away with the draft still dirty', async () => {
		const user = userEvent.setup();
		render(<Host />);

		await user.click(screen.getByRole('button', { name: 'edit one' }));

		expect(blocked()).toBe('true');

		await user.click(screen.getByRole('button', { name: 'close' }));

		expect(blocked()).toBe('false');
	});

	it('keeps holding for a dirty draft when a second, clean one disappears', async () => {
		const user = userEvent.setup();
		render(<Host second />);

		await user.click(screen.getByRole('button', { name: 'edit one' }));

		expect(blocked()).toBe('true');

		await user.click(screen.getByRole('button', { name: 'close companion' }));

		expect(blocked()).toBe('true');
	});

	it('needs every dirty draft to let go before the door opens', async () => {
		const user = userEvent.setup();
		render(<Host second />);

		await user.click(screen.getByRole('button', { name: 'edit one' }));
		await user.click(screen.getByRole('button', { name: 'edit two' }));

		expect(blocked()).toBe('true');

		await user.click(screen.getByRole('button', { name: 'discard one' }));

		expect(blocked()).toBe('true');

		await user.click(screen.getByRole('button', { name: 'discard two' }));

		expect(blocked()).toBe('false');
	});
});
