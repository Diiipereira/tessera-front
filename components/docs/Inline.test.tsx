import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Inline } from './Inline';

describe('Inline', () => {
	it('leaves plain text alone', () => {
		render(<Inline text="Nothing to mark up here." />);
		expect(screen.getByText('Nothing to mark up here.')).toBeInTheDocument();
	});

	it('renders backticks as code without the backticks', () => {
		const { container } = render(<Inline text="Grant `Manage Roles` first." />);
		const code = container.querySelector('code');

		expect(code).toHaveTextContent('Manage Roles');
		expect(container.textContent).toBe('Grant Manage Roles first.');
	});

	it('renders double asterisks as bold without the asterisks', () => {
		const { container } = render(<Inline text="This is **load bearing**." />);

		expect(container.querySelector('strong')).toHaveTextContent('load bearing');
		expect(container.textContent).toBe('This is load bearing.');
	});

	it('keeps a documentation link internal', () => {
		render(<Inline text="See [permissions](/docs/getting-started/permissions)." />);
		const link = screen.getByRole('link', { name: 'permissions' });

		expect(link).toHaveAttribute('href', '/docs/getting-started/permissions');
		expect(link).not.toHaveAttribute('rel', 'external');
	});

	it('links the documentation index', () => {
		render(<Inline text="Back to [the start](/docs)." />);

		expect(screen.getByRole('link', { name: 'the start' })).toHaveAttribute('href', '/docs');
	});

	it('marks anything off-site as external', () => {
		render(<Inline text="Read the [Discord docs](https://discord.com/developers)." />);
		const link = screen.getByRole('link', { name: 'Discord docs' });

		expect(link).toHaveAttribute('href', 'https://discord.com/developers');
		expect(link).toHaveAttribute('rel', 'external');
	});

	it('handles several tokens in one line', () => {
		const { container } = render(
			<Inline text="Set `xpMin` and **save** — see [levels](/docs/modules/levels)." />
		);

		expect(container.querySelectorAll('code')).toHaveLength(1);
		expect(container.querySelectorAll('strong')).toHaveLength(1);
		expect(container.querySelectorAll('a')).toHaveLength(1);
		expect(container.textContent).toBe('Set xpMin and save — see levels.');
	});
});
