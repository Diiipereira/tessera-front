import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SUPPORTED_LOCALES } from '@/lib/locale';
import type { SetupModule } from '@/lib/setup';
import type { Channel, Role } from '@/lib/types/discord';
import type { Guild } from '@/lib/types/guild';
import type { GuildSettings } from '@/lib/types/management';
import enUS from '@/messages/en-US.json';
import { Translated } from '@/tests/i18n';
import { SetupWizard } from './SetupWizard';

const patchModule = vi.hoisted(() => vi.fn());
const patchSettings = vi.hoisted(() => vi.fn());
const push = vi.hoisted(() => vi.fn());

vi.mock('@/lib/module-client', () => ({ patchModule }));
vi.mock('@/lib/settings-client', () => ({ patchSettings }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));

const success = vi.hoisted(() => vi.fn());
const failure = vi.hoisted(() => vi.fn());

vi.mock('sonner', () => ({
	toast: {
		success: (message: string) => {
			success(message);
		},
		error: (message: string, data?: { description?: string }) => {
			failure(message, data?.description);
		}
	}
}));

const GUILD_ID = '842315097461823104';
const CHANNEL_ID = '901234567890123001';

const GUILD: Guild = {
	id: GUILD_ID,
	name: 'Comunidade CJ GAMES',
	initials: 'CG',
	color: '#5865f2',
	iconUrl: null,
	memberCount: 12431,
	hasBot: true,
	reachedBySeat: false,
	tier: 'free',
	missingPermissions: []
};

const SETTINGS: GuildSettings = {
	locale: 'pt-BR',
	timezone: 'America/Sao_Paulo',
	embedColor: '#5865f2',
	botNickname: ''
};

const CHANNELS: Channel[] = [
	{ id: CHANNEL_ID, name: 'general', categoryId: 'cat-1', category: 'Text', kind: 'text' }
];

const ROLES: Role[] = [{ id: '2', name: 'Moderator', color: '#5865f2' }];

const MODULES: SetupModule[] = [
	{ id: 'welcome', enabled: false, version: 1, config: {} },
	{ id: 'moderation', enabled: false, version: 2, config: {} },
	{ id: 'logging', enabled: false, version: 1, config: {} },
	{ id: 'levels', enabled: true, version: 4, config: {} }
];

function renderWizard(modules: SetupModule[] = MODULES) {
	return render(
		<Translated>
			<SetupWizard
				guild={GUILD}
				settings={SETTINGS}
				modules={modules}
				channels={CHANNELS}
				roles={ROLES}
			/>
		</Translated>
	);
}

const stepTo = async (user: ReturnType<typeof userEvent.setup>, times: number) => {
	for (let index = 0; index < times; index += 1) {
		await user.click(screen.getByRole('button', { name: new RegExp(enUS.setup.next) }));
	}
};

describe('SetupWizard', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		patchSettings.mockResolvedValue({ status: 'saved', settings: SETTINGS });
		patchModule.mockResolvedValue({
			status: 'saved',
			state: { key: 'welcome', enabled: true, configured: true, config: {}, version: 2 }
		});
	});

	it('offers only the locales the API accepts, so the first step cannot write a value that fails', async () => {
		const user = userEvent.setup();
		renderWizard();

		await user.click(screen.getByRole('combobox', { name: enUS.setup.basics.language }));

		const options = await screen.findAllByRole('option');

		expect(options.map((option) => option.textContent)).toEqual(
			SUPPORTED_LOCALES.map((locale) => enUS.locales[locale])
		);
	});

	it('starts from what the guild already has on', async () => {
		const user = userEvent.setup();
		renderWizard();

		await stepTo(user, 1);

		expect(screen.getByRole('checkbox', { name: /Levels/ })).toBeChecked();
		expect(screen.getByRole('checkbox', { name: /Welcome/ })).not.toBeChecked();
	});

	it('asks where to greet only when welcome is part of the setup', async () => {
		const user = userEvent.setup();
		renderWizard();

		await stepTo(user, 2);

		expect(screen.queryByText(enUS.setup.channels.welcomeChannel)).not.toBeInTheDocument();
	});

	it('will not move on while welcome has nowhere to greet', async () => {
		const user = userEvent.setup();
		renderWizard();

		await stepTo(user, 1);
		await user.click(screen.getByRole('checkbox', { name: /Welcome/ }));
		await stepTo(user, 1);

		expect(screen.getByText(enUS.setup.channels.welcomeChannelMissing)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: new RegExp(enUS.setup.next) })).toBeDisabled();
	});

	it('saves the settings, then the modules, then that the wizard is done', async () => {
		const user = userEvent.setup();
		renderWizard();

		await stepTo(user, 3);
		await user.click(screen.getByRole('button', { name: new RegExp(enUS.setup.finish) }));

		await waitFor(() => {
			expect(patchSettings).toHaveBeenLastCalledWith(GUILD_ID, { setupCompleted: true });
		});

		expect(patchSettings).toHaveBeenNthCalledWith(1, GUILD_ID, {
			locale: 'pt-BR',
			timezone: 'America/Sao_Paulo'
		});
		expect(patchModule).toHaveBeenCalledWith(GUILD_ID, 'moderation', {
			version: 2,
			enabled: false,
			config: { protectedRoleIds: [] }
		});
	});

	it('opens the dashboard once everything is saved', async () => {
		const user = userEvent.setup();
		renderWizard();

		await stepTo(user, 3);
		await user.click(screen.getByRole('button', { name: new RegExp(enUS.setup.finish) }));

		await waitFor(() => {
			expect(push).toHaveBeenCalledWith(`/servers/${GUILD_ID}`);
		});
		expect(success).toHaveBeenCalled();
	});

	it('never says the setup is done when a module write failed', async () => {
		const user = userEvent.setup();

		patchModule.mockResolvedValue({ status: 'error', message: 'The API answered 400' });
		renderWizard();

		await stepTo(user, 3);
		await user.click(screen.getByRole('button', { name: new RegExp(enUS.setup.finish) }));

		await waitFor(() => {
			expect(failure).toHaveBeenCalled();
		});
		expect(patchSettings).toHaveBeenCalledTimes(1);
		expect(push).not.toHaveBeenCalled();
	});

	it('never touches the modules when the settings write failed', async () => {
		const user = userEvent.setup();

		patchSettings.mockResolvedValue({ status: 'error', message: 'The API answered 500' });
		renderWizard();

		await stepTo(user, 3);
		await user.click(screen.getByRole('button', { name: new RegExp(enUS.setup.finish) }));

		await waitFor(() => {
			expect(failure).toHaveBeenCalledWith(enUS.setup.failed, 'The API answered 500');
		});
		expect(patchModule).not.toHaveBeenCalled();
	});

	it('leaves a module the wizard did not touch out of the writes', async () => {
		const user = userEvent.setup();
		renderWizard([{ id: 'levels', enabled: true, version: 4, config: {} }]);

		await stepTo(user, 3);
		await user.click(screen.getByRole('button', { name: new RegExp(enUS.setup.finish) }));

		await waitFor(() => {
			expect(push).toHaveBeenCalled();
		});
		expect(patchModule).not.toHaveBeenCalled();
	});
});
