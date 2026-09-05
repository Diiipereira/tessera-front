import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionContext, type SessionState } from '@/components/providers/session-context';
import { BRAND } from '@/lib/brand';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Translated } from '@/tests/i18n';
import type { SessionUser } from '@/lib/types/session';
import { HeroActions } from './HeroActions';
import { PublicHeaderActions } from './PublicHeaderActions';

const pathname = vi.hoisted(() => ({ current: '/' }));

vi.mock('next/navigation', () => ({
	usePathname: () => pathname.current,
	useRouter: () => ({ refresh: () => undefined })
}));

const assign = vi.fn();

beforeEach(() => {
	pathname.current = '/';
	assign.mockClear();
	Object.defineProperty(window, 'location', {
		configurable: true,
		value: { href: 'http://localhost:3000/', assign }
	});
});

const user: SessionUser = {
	id: '393199508785201152',
	displayName: 'CJGAMES',
	handle: '@cjgames',
	initials: 'CJ',
	color: '#8b5cf6',
	avatarUrl: null
};

const anonymous: SessionState = { status: 'anonymous', user: null };
const loading: SessionState = { status: 'loading', user: null };
const unconfirmed: SessionState = { status: 'unconfirmed', user: null };
const signedIn: SessionState = { status: 'signed-in', user };

function withSession(state: SessionState, children: ReactNode) {
	return render(
		<Translated>
			<ThemeProvider>
				<SessionContext.Provider value={state}>{children}</SessionContext.Provider>
			</ThemeProvider>
		</Translated>
	);
}

describe('HeroActions', () => {
	it('offers only the invite to a visitor with no session', () => {
		withSession(anonymous, <HeroActions />);

		expect(
			screen.getByRole('link', { name: new RegExp(`Add ${BRAND.name} to Discord`) })
		).toBeInTheDocument();
		expect(screen.queryByRole('link', { name: /Open dashboard/ })).not.toBeInTheDocument();
	});

	it('keeps the invite as the primary action once signed in', () => {
		withSession(signedIn, <HeroActions />);

		expect(
			screen.getByRole('link', { name: new RegExp(`Add ${BRAND.name} to Discord`) })
		).toBeInTheDocument();
	});

	it('adds the dashboard shortcut once signed in', () => {
		withSession(signedIn, <HeroActions />);

		expect(screen.getByRole('link', { name: /Open dashboard/ })).toHaveAttribute(
			'href',
			'/servers'
		);
	});

	it('does not promise a dashboard while the session is still resolving', () => {
		withSession(loading, <HeroActions />);

		expect(screen.queryByRole('link', { name: /Open dashboard/ })).not.toBeInTheDocument();
	});

	it('keeps offering the dashboard when the API could not be reached', () => {
		withSession(unconfirmed, <HeroActions />);

		expect(screen.getByRole('link', { name: /Open dashboard/ })).toBeInTheDocument();
	});

	it('points the invite at a real authorize URL, not a placeholder', () => {
		withSession(anonymous, <HeroActions />);

		const href = screen
			.getByRole('link', { name: new RegExp(`Add ${BRAND.name} to Discord`) })
			.getAttribute('href');

		expect(href).toContain('https://discord.com/oauth2/authorize');
		expect(href).not.toContain('PLACEHOLDER');
	});
});

describe('PublicHeaderActions', () => {
	it('shows the sign-in button to a visitor with no session', () => {
		withSession(anonymous, <PublicHeaderActions />);

		expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
	});

	it('starts the Discord handshake instead of routing to a page that asks again', async () => {
		const user = userEvent.setup();
		withSession(anonymous, <PublicHeaderActions />);

		await user.click(screen.getByRole('button', { name: 'Sign in' }));

		const target = new URL(String(assign.mock.calls[0]?.[0]));

		expect(target.pathname).toBe('/auth/discord');
		expect(target.searchParams.get('returnTo')).toBe('/servers');
	});

	it('locks the button while the browser leaves', async () => {
		const user = userEvent.setup();
		withSession(anonymous, <PublicHeaderActions />);

		await user.click(screen.getByRole('button', { name: 'Sign in' }));

		expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled();
	});

	it('offers no second sign-in on the sign-in page itself', () => {
		pathname.current = '/login';
		withSession(anonymous, <PublicHeaderActions />);

		expect(screen.queryByRole('button', { name: 'Sign in' })).not.toBeInTheDocument();
	});

	it('still shows the account menu on the sign-in page when a session exists', () => {
		pathname.current = '/login';
		withSession(signedIn, <PublicHeaderActions />);

		expect(screen.getByRole('button', { name: 'Account menu' })).toBeInTheDocument();
	});

	it('swaps the sign-in button for the account menu once signed in', () => {
		withSession(signedIn, <PublicHeaderActions />);

		expect(screen.queryByRole('button', { name: 'Sign in' })).not.toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Account menu' })).toBeInTheDocument();
	});

	it('shows neither while the session is resolving, so the wrong state never flashes', () => {
		withSession(loading, <PublicHeaderActions />);

		expect(screen.queryByRole('button', { name: 'Sign in' })).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Account menu' })).not.toBeInTheDocument();
	});

	it('never claims a visitor is signed out just because the API was unreachable', () => {
		withSession(unconfirmed, <PublicHeaderActions />);

		expect(screen.queryByRole('button', { name: 'Sign in' })).not.toBeInTheDocument();
	});

	it('keeps the theme control in every state', () => {
		for (const state of [anonymous, loading, unconfirmed, signedIn]) {
			const view = withSession(state, <PublicHeaderActions />);

			expect(screen.getByRole('group', { name: 'Theme' })).toBeInTheDocument();
			view.unmount();
		}
	});
});
