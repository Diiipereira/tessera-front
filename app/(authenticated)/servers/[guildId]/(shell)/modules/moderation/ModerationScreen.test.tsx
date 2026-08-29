import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import enUS from '@/messages/en-US.json';
import { Translated } from '@/tests/i18n';
import type { Channel, Role } from '@/lib/types/discord';
import type { ModerationConfig } from '@/lib/modules/moderation';
import { ModerationScreen } from './ModerationScreen';

const patchModule = vi.fn();
const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock('sonner', () => ({
	toast: {
		success: (...args: unknown[]) => toastSuccess(...args) as unknown,
		error: (...args: unknown[]) => toastError(...args) as unknown
	}
}));

vi.mock('@/lib/module-client', () => ({
	patchModule: (...args: unknown[]) => patchModule(...args) as unknown
}));

const GUILD_ID = '842315097461823104';
const LOG_CHANNEL = '111111111111111111';
const STAFF_ROLE = '222222222222222222';
const VIP_ROLE = '333333333333333333';

const copy = enUS.modules.moderation;

const channels: Channel[] = [
	{ id: LOG_CHANNEL, name: 'mod-log', categoryId: null, category: 'Staff', kind: 'text' }
];

const roles: Role[] = [
	{ id: STAFF_ROLE, name: 'Staff', color: '#5865f2' },
	{ id: VIP_ROLE, name: 'VIP', color: '#fbbf24' }
];

const config: ModerationConfig = {
	enabled: true,
	logChannelId: LOG_CHANNEL,
	mutedRoleId: null,
	dmOnAction: true,
	requireReason: false,
	protectedRoleIds: [],
	banPurgeDays: 0,
	softbanPurgeDays: 1,
	timeoutDefault: '1h',
	dmExtra: '',
	appealUrl: '',
	escalationChannelId: null,
	escalationPingRoleIds: [],
	escalationAutoActions: []
};

const paint = (overrides: Partial<ModerationConfig> = {}) =>
	render(
		<ModerationScreen
			guildId={GUILD_ID}
			guildName="Tessera Dev"
			config={{ ...config, ...overrides }}
			version={4}
			channels={channels}
			roles={roles}
		/>,
		{ wrapper: Translated }
	);

describe('ModerationScreen', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('offers a log channel, which the screen never had before', () => {
		paint();

		expect(screen.getByText(copy.log.channel)).toBeInTheDocument();
	});

	it('says what happens to a protected member, including that reversals pass', () => {
		paint();

		expect(screen.getByText(copy.protected.reversalNote)).toBeInTheDocument();
	});

	it('keeps the two purge windows apart, because their defaults are opposite', () => {
		paint();

		expect(screen.getByText(copy.defaults.banPurge)).toBeInTheDocument();
		expect(screen.getByText(copy.defaults.softbanPurge)).toBeInTheDocument();
	});

	it('offers no default mute, since a mute has no duration by design', () => {
		paint();

		expect(screen.queryByText(/Default mute/i)).not.toBeInTheDocument();
	});

	it('hides the direct message fields when nobody is being told', () => {
		paint({ dmOnAction: false });

		expect(screen.queryByText(copy.dm.extra)).not.toBeInTheDocument();
	});

	it('shows what the member reads, with the bot sentence above the owner text', () => {
		paint({ dmExtra: 'Read the rules.' });

		const preview = screen.getByText(copy.dm.preview).parentElement as HTMLElement;

		expect(within(preview).getByText('You were warned in Tessera Dev.')).toBeInTheDocument();
		expect(within(preview).getByText('Read the rules.')).toBeInTheDocument();
	});

	it('warns when the engine needs a human and has nowhere to ask', () => {
		paint({ escalationAutoActions: ['warn'], escalationChannelId: null });

		expect(screen.getByText(copy.escalation.unreachable)).toBeInTheDocument();
	});

	it('stops warning once every action is automatic, since no call is needed', () => {
		paint({
			escalationAutoActions: ['warn', 'timeout', 'mute', 'kick', 'softban', 'ban'],
			escalationChannelId: null
		});

		expect(screen.queryByText(copy.escalation.unreachable)).not.toBeInTheDocument();
	});

	it('stops warning once a channel is chosen', () => {
		paint({ escalationAutoActions: ['warn'], escalationChannelId: LOG_CHANNEL });

		expect(screen.queryByText(copy.escalation.unreachable)).not.toBeInTheDocument();
	});

	it('says a protected member always reaches a human, whatever is ticked', () => {
		paint();

		expect(screen.getByText(copy.escalation.protectedNote)).toBeInTheDocument();
	});

	it('says the ladder itself does not exist yet, rather than implying it does', () => {
		paint();

		expect(screen.getByText(copy.escalation.notBuilt)).toBeInTheDocument();
	});

	it('starts clean, so no save bar', () => {
		paint();

		expect(
			screen.queryByRole('region', { name: enUS.modules.save.region })
		).not.toBeInTheDocument();
	});

	it('sends the whole config on save, with the version it was given', async () => {
		const user = userEvent.setup();
		patchModule.mockResolvedValue({
			status: 'saved',
			state: { key: 'moderation', enabled: true, config: {}, version: 5 }
		});
		paint();

		await user.click(screen.getByLabelText(copy.defaults.requireReason));
		await user.click(screen.getByRole('button', { name: enUS.modules.save.submit }));

		await waitFor(() => {
			expect(patchModule).toHaveBeenCalledWith(
				GUILD_ID,
				'moderation',
				expect.objectContaining({ version: 4 })
			);
		});

		const patch = patchModule.mock.calls[0]?.[2] as { config: Record<string, unknown> };

		expect(patch.config.requireReason).toBe(true);
		expect(patch.config.logChannelId).toBe(LOG_CHANNEL);
	});

	it('sends an empty text box as absent, so the DM gains no blank line', async () => {
		const user = userEvent.setup();
		patchModule.mockResolvedValue({
			status: 'saved',
			state: { key: 'moderation', enabled: true, config: {}, version: 5 }
		});
		paint({ dmExtra: '   ' });

		await user.click(screen.getByLabelText(copy.defaults.requireReason));
		await user.click(screen.getByRole('button', { name: enUS.modules.save.submit }));

		await waitFor(() => {
			expect(patchModule).toHaveBeenCalled();
		});

		const patch = patchModule.mock.calls[0]?.[2] as { config: Record<string, unknown> };

		expect(patch.config.dmExtra).toBeNull();
	});
});
