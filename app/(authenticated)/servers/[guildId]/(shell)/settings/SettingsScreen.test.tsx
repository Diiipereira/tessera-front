import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createTranslator } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GuildSettings } from '@/lib/types/management';
import enUS from '@/messages/en-US.json';
import ptBR from '@/messages/pt-BR.json';
import { Translated } from '@/tests/i18n';
import { SettingsScreen } from './SettingsScreen';

const push = vi.fn();
const removeBot = vi.fn();
const resetAllModules = vi.fn();
const refresh = vi.fn();
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
	removeBot: (guildId: string) => removeBot(guildId) as unknown,
	resetAllModules: (guildId: string) => resetAllModules(guildId) as unknown
}));

vi.mock('next/navigation', () => ({
	useRouter: () => ({ push, refresh })
}));

const GUILD_ID = '842315097461823104';
const GUILD_NAME = 'Comunidade CJ GAMES';

const SETTINGS: GuildSettings = {
	locale: 'pt-BR',
	timezone: 'America/Sao_Paulo',
	embedColor: '#5865f2',
	botNickname: 'Tessera'
};

const copy = enUS.settings;

const t = createTranslator({ locale: 'en-US', messages: enUS });

const UNBUILT = [copy.backup.export, copy.backup.import];

function setup() {
	return render(<SettingsScreen guildId={GUILD_ID} settings={SETTINGS} guildName={GUILD_NAME} />, {
		wrapper: Translated
	});
}

async function confirmRemoval() {
	const user = userEvent.setup();

	await user.click(screen.getByRole('button', { name: copy.danger.remove }));
	await user.type(screen.getByLabelText(t('confirm.type', { phrase: GUILD_NAME })), GUILD_NAME);
	await user.click(screen.getByRole('button', { name: copy.danger.confirmLabel }));
}

describe('SettingsScreen', () => {
	beforeEach(() => {
		push.mockReset();
		removeBot.mockReset();
		toastError.mockReset();
		toastSuccess.mockReset();
		removeBot.mockResolvedValue({ status: 'removed' });
		resetAllModules.mockReset();
		resetAllModules.mockResolvedValue({ status: 'reset' });
	});

	it('fills the scroll area, so the save bar ends at the bottom of a short screen', () => {
		const root = setup().container.firstElementChild as HTMLElement;

		expect(root.classList.contains('min-h-full')).toBe(true);
		expect(root.classList.contains('flex-col')).toBe(true);
	});

	it.each(UNBUILT)('keeps %s disabled while no API can carry it out', (name) => {
		setup();

		expect(screen.getByRole('button', { name })).toBeDisabled();
	});

	it('says which actions are missing instead of pretending they ran', () => {
		setup();

		expect(screen.getAllByText(copy.notAvailable)).toHaveLength(UNBUILT.length);
	});

	it('now offers to reset every module, which no route used to carry out', () => {
		setup();

		expect(screen.getByRole('button', { name: copy.danger.reset })).toBeEnabled();
	});

	it('asks for the server name before wiping the configuration', async () => {
		const user = userEvent.setup();
		setup();

		await user.click(screen.getByRole('button', { name: copy.danger.reset }));

		expect(await screen.findByRole('dialog')).toBeInTheDocument();
		expect(resetAllModules).not.toHaveBeenCalled();
	});

	it('resets every module once the name is typed', async () => {
		const user = userEvent.setup();
		setup();

		await user.click(screen.getByRole('button', { name: copy.danger.reset }));
		await user.type(screen.getByLabelText(t('confirm.type', { phrase: GUILD_NAME })), GUILD_NAME);
		await user.click(screen.getByRole('button', { name: copy.danger.resetConfirmLabel }));

		await waitFor(() => {
			expect(resetAllModules).toHaveBeenCalledWith(GUILD_ID);
		});
		expect(toastSuccess).toHaveBeenCalledWith(copy.danger.wasReset, {
			description: copy.danger.wasResetHint
		});
	});

	it('says the reset failed instead of claiming the modules are clean', async () => {
		resetAllModules.mockResolvedValue({ status: 'error', message: 'The API answered 403' });

		const user = userEvent.setup();
		setup();

		await user.click(screen.getByRole('button', { name: copy.danger.reset }));
		await user.type(screen.getByLabelText(t('confirm.type', { phrase: GUILD_NAME })), GUILD_NAME);
		await user.click(screen.getByRole('button', { name: copy.danger.resetConfirmLabel }));

		await waitFor(() => {
			expect(toastError).toHaveBeenCalled();
		});
		expect(toastSuccess).not.toHaveBeenCalled();
	});

	it('leaves the settings that do save alone', () => {
		setup();

		expect(screen.getByDisplayValue('Tessera')).toBeEnabled();
		expect(screen.getByDisplayValue('#5865f2')).toBeEnabled();
		expect(
			screen.getByRole('button', { name: t('settings.appearance.useColor', { color: '#5865f2' }) })
		).toBeEnabled();
	});

	describe('removing the bot', () => {
		it('offers the removal, because the API can carry this one out', () => {
			setup();

			expect(screen.getByRole('button', { name: copy.danger.remove })).toBeEnabled();
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
				expect(toastError).toHaveBeenCalledWith(copy.danger.removeFailed, {
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
					t('settings.danger.left', { brand: 'Tessera', guild: GUILD_NAME }),
					{ description: copy.danger.leftHint }
				);
			});
			expect(toastError).not.toHaveBeenCalled();
		});
	});

	it('shows the stored server language, which is what the bot writes in', () => {
		setup();

		expect(screen.getByRole('combobox', { name: copy.language.serverLanguage })).toHaveTextContent(
			enUS.locales['pt-BR']
		);
	});

	it('reads in the language the reader picked, not in English by default', () => {
		render(<SettingsScreen guildId={GUILD_ID} settings={SETTINGS} guildName={GUILD_NAME} />, {
			wrapper: ({ children }) => <Translated locale="pt-BR">{children}</Translated>
		});

		expect(
			screen.getByRole('heading', { name: ptBR.settings.title, level: 1 })
		).toBeInTheDocument();
		expect(screen.getByText(ptBR.settings.danger.title)).toBeInTheDocument();
	});
});
