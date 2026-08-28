import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { InvitePreviewDto, InviteState } from '@/lib/api-url';
import enUS from '@/messages/en-US.json';
import { Translated } from '@/tests/i18n';
import { InviteScreen } from './InviteScreen';

const replace = vi.fn();
const toastError = vi.fn();
const acceptInvite = vi.fn();
const assign = vi.fn();

vi.mock('sonner', () => ({
	toast: {
		error: (...args: unknown[]) => toastError(...args) as unknown,
		success: () => undefined
	}
}));

vi.mock('next/navigation', () => ({
	useRouter: () => ({ replace })
}));

vi.mock('@/lib/invite-client', () => ({
	acceptInvite: (...args: unknown[]) => acceptInvite(...args) as unknown
}));

const TOKEN = 'a-very-long-opaque-token';
const GUILD_ID = '842315097461823104';

const preview = (state: InviteState = 'open'): InvitePreviewDto => ({
	guildId: GUILD_ID,
	guildName: 'Comunidade CJ GAMES',
	role: 'moderator',
	state
});

function renderScreen(state: InviteState = 'open', signedIn = true) {
	return render(
		<Translated>
			<InviteScreen token={TOKEN} preview={preview(state)} signedIn={signedIn} />
		</Translated>
	);
}

beforeEach(() => {
	vi.clearAllMocks();
	acceptInvite.mockResolvedValue({
		status: 'accepted',
		accepted: { guildId: GUILD_ID, role: 'moderator', alreadyHadAccess: false }
	});
	Object.defineProperty(window, 'location', {
		value: { assign },
		configurable: true
	});
});

describe('InviteScreen', () => {
	it('names the server and the seat, so nobody accepts blind', () => {
		renderScreen();

		expect(screen.getByRole('heading').textContent).toContain('Comunidade CJ GAMES');
		expect(screen.getByText(/Moderator/)).toBeDefined();
	});

	it('asks an anonymous visitor to sign in, since the link carries no identity', async () => {
		renderScreen('open', false);

		await userEvent.click(screen.getByRole('button', { name: enUS.invitePage.signIn }));

		expect(assign).toHaveBeenCalledWith(expect.stringContaining(`%2Finvite%2F${TOKEN}`));
		expect(acceptInvite).not.toHaveBeenCalled();
	});

	it('redeems for someone already signed in and lands them on the server', async () => {
		renderScreen();

		await userEvent.click(screen.getByRole('button', { name: enUS.invitePage.accept }));

		await waitFor(() => {
			expect(acceptInvite).toHaveBeenCalledWith(TOKEN);
		});
		expect(replace).toHaveBeenCalledWith(`/servers/${GUILD_ID}`);
	});

	it('stays put and says why when the API refuses', async () => {
		acceptInvite.mockResolvedValue({
			status: 'error',
			message: 'That invite link was already used'
		});
		renderScreen();

		await userEvent.click(screen.getByRole('button', { name: enUS.invitePage.accept }));

		await waitFor(() => {
			expect(toastError).toHaveBeenCalledWith('That invite link was already used');
		});
		expect(replace).not.toHaveBeenCalled();
	});

	it.each(['used', 'revoked', 'expired'] as const)(
		'offers no button at all for a %s link',
		(state) => {
			renderScreen(state);

			expect(screen.queryByRole('button')).toBeNull();
			expect(screen.getByRole('heading').textContent).toBe(enUS.invitePage.dead[state].title);
		}
	);
});
