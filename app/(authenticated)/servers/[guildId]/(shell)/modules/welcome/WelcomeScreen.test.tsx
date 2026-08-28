import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createTranslator } from 'next-intl';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TooltipProvider } from '@/components/ui/tooltip-provider';
import { emptyEmbedDraft, welcomeVariables } from '@/lib/modules/welcome';
import type { Channel, Role } from '@/lib/types/discord';
import type { WelcomeConfig } from '@/lib/types/modules';
import enUS from '@/messages/en-US.json';
import { Translated } from '@/tests/i18n';
import { WelcomeScreen } from './WelcomeScreen';

const copy = enUS.modules.welcome;

const changed = (count: number) =>
	createTranslator({ locale: 'en-US', messages: enUS, namespace: 'modules.save' })('modified', {
		count
	});

const patchModule = vi.hoisted(() => vi.fn());

vi.mock('@/lib/module-client', () => ({ patchModule }));

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

const GUILD_ID = '931562055025168435';
const CHANNEL_ID = '901234567890123001';

const channels: Channel[] = [
	{ id: CHANNEL_ID, name: 'teste', category: 'Text channels', kind: 'text' }
];

const roles: Role[] = [
	{ id: '801234567890123001', name: 'Member', color: '#57f287' },
	{ id: '801234567890123002', name: 'Verified', color: '#3ba55d' },
	{ id: '801234567890123003', name: 'Booster', color: '#f47fff' },
	{ id: '801234567890123004', name: 'Event Host', color: '#fee75c' },
	{ id: '801234567890123005', name: 'Veteran', color: '#eb459e' },
	{ id: '801234567890123006', name: 'Artist', color: '#5865f2' }
];

const config: WelcomeConfig = {
	enabled: true,
	channelId: CHANNEL_ID,
	message: {
		mode: 'embed',
		text: 'Welcome {user} to {server}!',
		embed: {
			...emptyEmbedDraft(),
			title: 'Welcome to {server}',
			description: 'Glad you made it, {user}'
		}
	},
	autoRoleIds: [],
	pingMode: 'none',
	deleteAfter: null
};

const variables = welcomeVariables('Tessera Dev');

function renderScreen(overrides: Partial<WelcomeConfig> = {}) {
	return render(
		<TooltipProvider>
			<WelcomeScreen
				guildId={GUILD_ID}
				config={{ ...config, ...overrides }}
				version={4}
				channels={channels}
				roles={roles}
				variables={variables}
			/>
		</TooltipProvider>,
		{ wrapper: Translated }
	);
}

const previewPanel = () => screen.getByRole('region', { name: enUS.modules.preview.title });

const saveBar = () => screen.queryByRole('region', { name: enUS.modules.save.region });

const saveButton = () => screen.getByRole('button', { name: /Save/ });

describe('WelcomeScreen', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders the module header with its master switch', () => {
		renderScreen();

		expect(screen.getByRole('heading', { name: copy.title, level: 1 })).toBeInTheDocument();
		expect(screen.getByLabelText(enUS.modules.enabled)).toBeChecked();
	});

	it('starts with a clean form, so no save bar', () => {
		renderScreen();

		expect(saveBar()).not.toBeInTheDocument();
	});

	it('raises the save bar on the first edit', async () => {
		const user = userEvent.setup();
		renderScreen();

		await user.click(screen.getByLabelText(enUS.modules.enabled));

		expect(saveBar()).toBeInTheDocument();
		expect(screen.getByText(changed(1))).toBeInTheDocument();
	});

	it('substitutes only the variables the bot actually replaces', () => {
		renderScreen();

		expect(within(previewPanel()).getByText('Welcome to Tessera Dev')).toBeInTheDocument();
		expect(within(previewPanel()).getByText(/Glad you made it, novato/)).toBeInTheDocument();
	});

	it('offers exactly the two variables the greeting understands', () => {
		renderScreen();

		expect(screen.getAllByRole('button', { name: '{user}' }).length).toBeGreaterThan(0);
		expect(screen.getAllByRole('button', { name: '{server}' }).length).toBeGreaterThan(0);
		expect(screen.queryByRole('button', { name: '{memberCount}' })).not.toBeInTheDocument();
	});

	it('sends the registry shape to the API, not the shape of the form', async () => {
		const user = userEvent.setup();
		patchModule.mockResolvedValue({
			status: 'saved',
			state: { key: 'welcome', enabled: false, config: {}, version: 5 }
		});

		renderScreen();

		await user.click(screen.getByLabelText(enUS.modules.enabled));
		await user.click(saveButton());

		await waitFor(() => {
			expect(patchModule).toHaveBeenCalledTimes(1);
		});

		const [guildId, moduleKey, body] = patchModule.mock.calls[0] as [
			string,
			string,
			{ version: number; enabled: boolean; config: Record<string, unknown> }
		];

		expect(guildId).toBe(GUILD_ID);
		expect(moduleKey).toBe('welcome');
		expect(body.version).toBe(4);
		expect(body.enabled).toBe(false);
		expect(body.config).toEqual({
			channelId: CHANNEL_ID,
			message: 'Welcome {user} to {server}!',
			useEmbed: true,
			embed: config.message.embed,
			autoRoles: [],
			pingMode: 'none',
			deleteAfter: null
		});
	});

	it('carries the version the API returned into the next save', async () => {
		const user = userEvent.setup();
		patchModule.mockResolvedValue({
			status: 'saved',
			state: {
				key: 'welcome',
				enabled: false,
				config: { channelId: CHANNEL_ID, message: 'Welcome {user} to {server}!' },
				version: 5
			}
		});

		renderScreen();

		await user.click(screen.getByLabelText(enUS.modules.enabled));
		await user.click(saveButton());
		await waitFor(() => {
			expect(success).toHaveBeenCalledWith(copy.saved);
		});

		await user.click(screen.getByLabelText(enUS.modules.disabled));
		await user.click(saveButton());

		await waitFor(() => {
			expect(patchModule).toHaveBeenCalledTimes(2);
		});

		const second = patchModule.mock.calls[1] as [string, string, { version: number }];

		expect(second[2].version).toBe(5);
	});

	it('tells the member what went wrong instead of claiming it saved', async () => {
		const user = userEvent.setup();
		patchModule.mockResolvedValue({ status: 'error', message: 'message: Too big' });

		renderScreen();

		await user.click(screen.getByLabelText(enUS.modules.enabled));
		await user.click(saveButton());

		await waitFor(() => {
			expect(failure).toHaveBeenCalledWith(copy.saveFailed, 'message: Too big');
		});
		expect(success).not.toHaveBeenCalled();
	});

	it('refuses to swallow a write that landed after someone else edited', async () => {
		const user = userEvent.setup();
		patchModule.mockResolvedValue({
			status: 'conflict',
			state: {
				key: 'welcome',
				enabled: true,
				config: { message: 'Changed elsewhere', channelId: CHANNEL_ID },
				version: 9
			}
		});

		renderScreen();

		await user.click(screen.getByLabelText(enUS.modules.enabled));
		await user.click(saveButton());

		await waitFor(() => {
			expect(screen.getByText(/changed/i)).toBeInTheDocument();
		});
		expect(success).not.toHaveBeenCalled();
	});

	it('never lets the autorole picker exceed what the registry allows', async () => {
		const user = userEvent.setup();
		renderScreen();

		const picker = screen.getByRole('button', { name: /role/i });
		await user.click(picker);

		for (const role of roles) {
			const option = screen.queryByRole('option', { name: new RegExp(role.name) });
			if (option) await user.click(option);
		}

		expect(screen.queryByText('6 roles')).not.toBeInTheDocument();
	});
});
