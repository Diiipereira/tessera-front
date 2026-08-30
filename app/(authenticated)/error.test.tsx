import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Translated } from '@/tests/i18n';
import AuthenticatedError from './error';

const failure = (over: Partial<Error & { digest?: string }> = {}): Error & { digest?: string } =>
	Object.assign(new Error('The API did not answer: fetch failed.'), over);

const paint = (error = failure(), retry = vi.fn(), locale: 'en-US' | 'pt-BR' = 'en-US') => {
	render(
		<Translated locale={locale}>
			<AuthenticatedError error={error} retry={retry} />
		</Translated>
	);

	return retry;
};

describe('the authenticated error boundary', () => {
	it('says the screen failed instead of showing the Next crash page', () => {
		paint();

		expect(screen.getByText('This screen could not load.')).toBeInTheDocument();
	});

	it('offers to try again, which refetches instead of only clearing the error', async () => {
		const user = userEvent.setup();
		const retry = paint();

		await user.click(screen.getByRole('button', { name: 'Try again' }));

		expect(retry).toHaveBeenCalledTimes(1);
	});

	it('shows the digest, which is the only thread back to the server log', () => {
		paint(failure({ digest: '2947183746' }));

		expect(screen.getByText('Reference 2947183746')).toBeInTheDocument();
	});

	it('says nothing about a reference when the error carries no digest', () => {
		paint();

		expect(screen.queryByText(/Reference/)).not.toBeInTheDocument();
	});

	it('shows the real message outside production, where Next still forwards it', () => {
		paint();

		expect(screen.getByText('The API did not answer: fetch failed.')).toBeInTheDocument();
	});

	it('speaks Portuguese too', () => {
		paint(failure(), vi.fn(), 'pt-BR');

		expect(screen.getByText('Não deu para carregar esta tela.')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Tentar de novo' })).toBeInTheDocument();
	});
});
