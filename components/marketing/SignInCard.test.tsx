import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loginErrorFor, type LoginErrorKind } from '@/lib/auth';
import { mockUser } from '@/lib/mock';
import type { SessionUser } from '@/lib/types/session';
import { Translated } from '@/tests/i18n';
import { SignInCard } from './SignInCard';

const assign = vi.fn();

function renderCard(error: LoginErrorKind | null, user: SessionUser | null) {
	render(
		<Translated>
			<SignInCard error={error} user={user} />
		</Translated>
	);
}

beforeEach(() => {
	assign.mockClear();
	Object.defineProperty(window, 'location', {
		configurable: true,
		value: { href: 'http://localhost:3000/login', assign }
	});
});

describe('SignInCard', () => {
	it('offers Discord and nothing else when there is no session', () => {
		renderCard(null, null);

		expect(screen.getByRole('heading', { name: 'Sign in to the dashboard' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Continue with Discord/ })).toBeInTheDocument();
		expect(screen.queryByRole('button', { name: /Try again/ })).not.toBeInTheDocument();
		expect(screen.queryByRole('link', { name: /Use another account/ })).not.toBeInTheDocument();
		expect(screen.getByText(/We never read your messages/)).toBeInTheDocument();
	});

	it('surfaces the error the URL asked for, with a retry', () => {
		renderCard(loginErrorFor('access_denied'), null);

		const alert = screen.getByRole('alert');
		expect(alert).toHaveTextContent('You declined the Discord prompt');
		expect(screen.getByRole('button', { name: /Try again/ })).toBeInTheDocument();
	});

	it('names the account and drops the scopes note once signed in', () => {
		renderCard(null, mockUser);

		expect(screen.getByRole('heading', { name: "You're already signed in" })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: /Use another account/ })).toHaveAttribute(
			'href',
			'/logout'
		);
		expect(screen.queryByText(/We never read your messages/)).not.toBeInTheDocument();
	});

	it('walks a signed-in visitor to the dashboard instead of back through Discord', () => {
		renderCard(null, mockUser);

		expect(screen.getByRole('link', { name: `Continue as ${mockUser.handle}` })).toHaveAttribute(
			'href',
			'/servers'
		);
	});

	it('never offers to restart the handshake for a session that is already valid', () => {
		renderCard(null, mockUser);

		expect(screen.queryByRole('button', { name: /Continue with Discord/ })).not.toBeInTheDocument();
		expect(
			screen.queryByRole('button', { name: /Redirecting to Discord/ })
		).not.toBeInTheDocument();
	});

	it('still offers Discord as the only door when there is no session', () => {
		renderCard(null, null);

		expect(screen.queryByRole('link', { name: /Continue as/ })).not.toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Continue with Discord/ })).toBeInTheDocument();
	});

	it('leaves for the API handshake and locks the button while it goes', async () => {
		const user = userEvent.setup();
		renderCard(null, null);

		await user.click(screen.getByRole('button', { name: /Continue with Discord/ }));

		expect(assign).toHaveBeenCalledWith('http://localhost:3001/auth/discord?returnTo=%2Fservers');
		expect(screen.getByRole('button', { name: /Redirecting to Discord/ })).toBeDisabled();
	});

	it('asks the API to send the browser back to the server picker', async () => {
		const user = userEvent.setup();
		renderCard(null, null);

		await user.click(screen.getByRole('button', { name: /Continue with Discord/ }));

		const target = new URL(String(assign.mock.calls[0]?.[0]));

		expect(target.pathname).toBe('/auth/discord');
		expect(target.searchParams.get('returnTo')).toBe('/servers');
	});
});
