import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toGameAlertsConfig } from '@/lib/modules/game-alerts';
import enUS from '@/messages/en-US.json';
import { Translated } from '@/tests/i18n';
import { GameAlertsScreen } from './GameAlertsScreen';

const preview = vi.hoisted(() => vi.fn());
const sendTest = vi.hoisted(() => vi.fn());
const toast = vi.hoisted(() => ({ success: vi.fn(), warning: vi.fn(), error: vi.fn() }));

vi.mock('@/lib/game-alerts-client', () => ({
	previewGameAlert: preview,
	sendGameAlertTest: sendTest
}));

vi.mock('sonner', () => ({ toast }));

const copy = enUS.modules.gameAlerts;

const luftrausers = {
	store: 'epic',
	title: 'Luftrausers',
	url: 'https://store.epicgames.com/p/luftrausers-51e5e9',
	imageUrl: null,
	startsAt: '2026-09-10T15:00:00.000Z',
	endsAt: '2026-09-17T15:00:00.000Z'
};

const answer = (
	running: unknown[],
	upcoming: unknown[] = [],
	embeds: unknown[] = [{ title: 'Luftrausers' }]
): unknown => ({ status: 'ok', preview: { content: '', embeds, running, upcoming } });

const screenOf = (): React.ReactElement => (
	<GameAlertsScreen
		guildId="931562055025168435"
		config={toGameAlertsConfig(
			{ enabled: true, config: { channelId: '111111111111111111' } },
			'#5865f2'
		)}
		defaultColor="#5865f2"
		version={1}
		channels={[]}
		roles={[]}
		botName="Tessera Dev"
		botAvatarUrl={null}
		now="2026-09-12T12:00:00.000Z"
	/>
);

describe('GameAlertsScreen', () => {
	beforeEach(() => {
		preview.mockReset();
		sendTest.mockReset();
		toast.success.mockReset();
		toast.warning.mockReset();
		toast.error.mockReset();
		preview.mockResolvedValue(answer([luftrausers]));
		sendTest.mockResolvedValue({ status: 'ok', outcome: 'sent' });
	});

	it('draws the preview the API built, with the free game of the week', async () => {
		render(screenOf(), { wrapper: Translated });

		expect(await screen.findByText('Luftrausers')).toBeInTheDocument();
	});

	it('says the store has nothing instead of drawing an empty card', async () => {
		preview.mockResolvedValue(answer([], [], []));
		render(screenOf(), { wrapper: Translated });

		expect(await screen.findByText(copy.preview.none)).toBeInTheDocument();
	});

	it('says the preview shows the next game when nothing is free right now', async () => {
		preview.mockResolvedValue(answer([], [luftrausers]));
		render(screenOf(), { wrapper: Translated });

		expect(await screen.findByText(copy.preview.nextSample)).toBeInTheDocument();
	});

	it('answers in the reader language when the store has nothing to test with', async () => {
		sendTest.mockResolvedValue({ status: 'ok', outcome: 'no-offer' });
		render(screenOf(), { wrapper: Translated });

		await userEvent.click(screen.getByRole('button', { name: copy.test.action }));

		expect(toast.warning).toHaveBeenCalledWith(copy.test.noOffer);
	});

	it('will not test a draft, because the test posts what is saved', async () => {
		render(screenOf(), { wrapper: Translated });

		await userEvent.click(screen.getByRole('switch', { name: copy.upcoming.label }));

		expect(screen.getByRole('button', { name: copy.test.action })).toBeDisabled();
	});
});
