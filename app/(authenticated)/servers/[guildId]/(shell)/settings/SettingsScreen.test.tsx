import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GuildSettings } from '@/lib/types/management';
import { SettingsScreen } from './SettingsScreen';

const push = vi.fn();
const removeBot = vi.fn();
const toastError = vi.fn();
const toastSuccess = vi.fn();

vi.mock('sonner', () => ({
	toast: {
		error: (...args: unknown[]) => toastError(...args) as unknown,
		success: (...args: unknown[]) => toastSuccess(...args) as unknown
	}
}));

vi.mock('@/lib/settings-client', () => ({
	patchSettings: vi.fn()
}));

vi.mock('@/lib/guild-bot-client', () => ({
	removeBot: (guildId: string) => removeBot(guildId) as unknown
}));

vi.mock('next/navigation', () => ({
	useRouter: () => ({ push })
}));

const GUILD_ID = '842315097461823104';
const GUILD_NAME = 'Comunidade CJ GAMES';

const SETTINGS: GuildSettings = {
	locale: 'pt-BR',
	timezone: 'America/Sao_Paulo',
	embedColor: '#5865f2',
	botNickname: 'Tessera'
};

const UNBUILT = ['Export', 'Import', 'Reset'];

function setup() {
	render(<SettingsScreen guildId={GUILD_ID} settings={SETTINGS} guildName={GUILD_NAME} />);
}

async function confirmRemoval() {
	const user = userEvent.setup();

	await user.click(screen.getByRole('button', { name: 'Remove bot' }));
	await user.type(screen.getByLabelText(`Type ${GUILD_NAME} to confirm`), GUILD_NAME);
	await user.click(screen.getByRole('button', { name: 'Remove the bot' }));
}

describe('SettingsScreen', () => {
	beforeEach(() => {
		push.mockReset();
		removeBot.mockReset();
		toastError.mockReset();
		toastSuccess.mockReset();
		removeBot.mockResolvedValue({ status: 'removed' });
	});

	it.each(UNBUILT)('keeps %s disabled while no API can carry it out', (name) => {
		setup();

		expect(screen.getByRole('button', { name })).toBeDisabled();
	});

	it('says which actions are missing instead of pretending they ran', () => {
		setup();

		expect(screen.getAllByText('Not available yet')).toHaveLength(UNBUILT.length);
	});

	it('leaves the settings that do save alone', () => {
		setup();

		expect(screen.getByDisplayValue('Tessera')).toBeEnabled();
		expect(screen.getByDisplayValue('#5865f2')).toBeEnabled();
		expect(screen.getByRole('button', { name: 'Use #5865f2' })).toBeEnabled();
	});

	describe('removing the bot', () => {
		it('offers the removal, because the API can carry this one out', () => {
			setup();

			expect(screen.getByRole('button', { name: 'Remove bot' })).toBeEnabled();
		});

		it('asks the API to remove the bot from this guild, and only this guild', async () => {
			setup();
			await confirmRemoval();

			await waitFor(() => {
				expect(removeBot).toHaveBeenCalledWith(GUILD_ID);
			});
			expect(removeBot).toHaveBeenCalledTimes(1);
		});

		it('sends the admin back to the server list, which no longer lists this one', async () => {
			setup();
			await confirmRemoval();

			await waitFor(() => {
				expect(push).toHaveBeenCalledWith('/servers');
			});
		});

		it('never says the bot left when the API refused', async () => {
			removeBot.mockResolvedValue({ status: 'error', message: 'Only the owner can do that' });

			setup();
			await confirmRemoval();

			await waitFor(() => {
				expect(toastError).toHaveBeenCalledWith('Could not remove the bot', {
					description: 'Only the owner can do that'
				});
			});
			expect(toastSuccess).not.toHaveBeenCalled();
			expect(push).not.toHaveBeenCalled();
		});

		it('says it left only once the API said so', async () => {
			setup();
			await confirmRemoval();

			await waitFor(() => {
				expect(toastSuccess).toHaveBeenCalledWith(
					`Tessera left ${GUILD_NAME}`,
					expect.objectContaining({ description: expect.any(String) as unknown })
				);
			});
			expect(toastError).not.toHaveBeenCalled();
		});
	});
});
