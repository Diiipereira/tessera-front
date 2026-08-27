import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
	it('renders a button when there is no href', () => {
		render(<Button>Save</Button>);
		expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
	});

	it('renders a link when there is an href', () => {
		render(<Button href="/login">Sign in</Button>);
		expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');
	});

	it('calls onClick', async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();

		render(<Button onClick={onClick}>Save</Button>);
		await user.click(screen.getByRole('button', { name: 'Save' }));

		expect(onClick).toHaveBeenCalledOnce();
	});

	it('blocks clicks while loading and says so to assistive tech', async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();

		render(
			<Button loading onClick={onClick}>
				Save
			</Button>
		);

		const button = screen.getByRole('button', { name: /Save/ });
		expect(button).toBeDisabled();
		expect(button).toHaveAttribute('aria-busy', 'true');

		await user.click(button);
		expect(onClick).not.toHaveBeenCalled();
	});

	it('marks a disabled link with aria-disabled, since anchors have no disabled state', () => {
		render(
			<Button href="/login" disabled>
				Sign in
			</Button>
		);
		expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('aria-disabled', 'true');
	});

	it('applies the size the caller asked for', () => {
		render(
			<>
				<Button size="sm">Small</Button>
				<Button size="lg">Large</Button>
			</>
		);

		expect(screen.getByRole('button', { name: 'Small' })).toHaveClass('h-8');
		expect(screen.getByRole('button', { name: 'Large' })).toHaveClass('h-10');
	});

	it('drops the horizontal padding for an icon-only button so it stays square', () => {
		render(
			<Button iconOnly aria-label="Close">
				<span />
			</Button>
		);

		const button = screen.getByRole('button', { name: 'Close' });
		expect(button).toHaveClass('w-9');
		expect(button).toHaveClass('px-0');
	});

	it('lets the caller add classes without losing the variant', () => {
		render(<Button className="mt-4">Save</Button>);

		const button = screen.getByRole('button', { name: 'Save' });
		expect(button).toHaveClass('mt-4');
		expect(button).toHaveClass('bg-primary');
	});
});
