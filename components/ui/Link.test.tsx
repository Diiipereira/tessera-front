import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { MouseEvent, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { NavigationBlockerProvider } from '@/components/providers/NavigationBlocker';
import {
	useNavigationBlockerStore,
	useNavigationRefusals
} from '@/components/providers/navigation-blocker-context';
import { Link } from './Link';

const navigated = vi.hoisted(() => vi.fn());
const marked = vi.hoisted(() => vi.fn());

vi.mock('next/link', () => ({
	default: ({
		href,
		children,
		onClick
	}: {
		href: string;
		children: ReactNode;
		onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
	}) => (
		<a
			href={href}
			onClick={(event) => {
				onClick?.(event);

				const cancelled = event.defaultPrevented;

				event.preventDefault();

				if (!cancelled) navigated(href);
			}}
		>
			{children}
		</a>
	)
}));

function Controls() {
	const store = useNavigationBlockerStore();
	const refusals = useNavigationRefusals();

	return (
		<>
			<button
				type="button"
				onClick={() => {
					store.hold('editor');
				}}
			>
				block
			</button>
			<span data-testid="refusals">{refusals}</span>
		</>
	);
}

function show() {
	navigated.mockClear();
	marked.mockClear();

	render(
		<NavigationBlockerProvider>
			<Controls />
			<Link
				href="/servers"
				onClick={() => {
					marked();
				}}
			>
				Servers
			</Link>
		</NavigationBlockerProvider>
	);

	return userEvent.setup();
}

describe('Link', () => {
	it('lets a navigation through while nothing is blocking', async () => {
		const user = show();

		await user.click(screen.getByRole('link', { name: 'Servers' }));

		expect(navigated).toHaveBeenCalledWith('/servers');
		expect(marked).toHaveBeenCalled();
		expect(screen.getByTestId('refusals')).toHaveTextContent('0');
	});

	it('cancels the navigation and counts the refusal while a draft is unsaved', async () => {
		const user = show();

		await user.click(screen.getByRole('button', { name: 'block' }));
		await user.click(screen.getByRole('link', { name: 'Servers' }));

		expect(navigated).not.toHaveBeenCalled();
		expect(screen.getByTestId('refusals')).toHaveTextContent('1');
	});

	it('never runs the click the caller attached, because that is what paints the next screen', async () => {
		const user = show();

		await user.click(screen.getByRole('button', { name: 'block' }));
		await user.click(screen.getByRole('link', { name: 'Servers' }));

		expect(marked).not.toHaveBeenCalled();
	});

	it('stays out of the way of a click that opens somewhere else', async () => {
		const user = show();

		await user.click(screen.getByRole('button', { name: 'block' }));
		await user.keyboard('{Control>}');
		await user.click(screen.getByRole('link', { name: 'Servers' }));
		await user.keyboard('{/Control}');

		expect(marked).toHaveBeenCalled();
		expect(screen.getByTestId('refusals')).toHaveTextContent('0');
	});
});
