import { render, screen, waitFor } from '@testing-library/react';
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

const astral = { ...luftrausers, title: 'Astral Ascent' };

const claim = {
	type: 1,
	components: [{ type: 2, style: 5, label: 'Claim on Epic Games Store', url: luftrausers.url }]
};

const answer = (
	running: unknown[],
	upcoming: unknown[] = [],
	embeds: unknown[] = [{ title: 'Luftrausers' }]
): unknown => ({
	status: 'ok',
	preview: {
		sender: { name: 'Tessera Gaming', avatarUrl: null },
		content: '',
		embeds,
		components: embeds.length === 0 ? [] : [claim],
		running,
		upcoming,
		spacingMinutes: 5
	}
});

const screenOf = (): React.ReactElement => (
	<GameAlertsScreen
		guildId="931562055025168435"
		config={toGameAlertsConfig({ enabled: true, config: { channelId: '111111111111111111' } })}
		version={1}
		channels={[]}
		roles={[]}
	/>
);

const sentBodies = (): unknown[] => preview.mock.calls.map((call: unknown[]) => call[1]);

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

	it('signs the message as Tessera Gaming, the name Discord shows above it', async () => {
		render(screenOf(), { wrapper: Translated });

		expect(await screen.findByText('Tessera Gaming')).toBeInTheDocument();
	});

	it('draws the claim link as a button that opens the store', async () => {
		render(screenOf(), { wrapper: Translated });

		expect(await screen.findByRole('link', { name: 'Claim on Epic Games Store' })).toHaveAttribute(
			'href',
			luftrausers.url
		);
	});

	it('dates what comes next the way Discord prints it in the footer', async () => {
		const startsAt = '2026-09-17T15:00:00.000Z';
		const stamp = new Intl.DateTimeFormat('en-US', {
			dateStyle: 'short',
			timeStyle: 'short'
		}).format(new Date(startsAt));

		preview.mockResolvedValue(
			answer(
				[luftrausers],
				[],
				[{ title: 'Luftrausers', footer: { text: 'Next up: Mindcop' }, timestamp: startsAt }]
			)
		);
		render(screenOf(), { wrapper: Translated });

		expect(await screen.findByText(`Next up: Mindcop • ${stamp}`)).toBeInTheDocument();
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

	it('says how far apart the messages go out when more than one game is free', async () => {
		preview.mockResolvedValue(answer([luftrausers, astral]));
		render(screenOf(), { wrapper: Translated });

		expect(
			await screen.findByText(
				copy.preview.spacing.replace('{count}', '2').replace('{minutes}', '5')
			)
		).toBeInTheDocument();
	});

	it('asks the preview for @everyone once the switch is on', async () => {
		render(screenOf(), { wrapper: Translated });

		await userEvent.click(screen.getByRole('switch', { name: copy.mention.everyone }));

		await waitFor(() => {
			expect(sentBodies().at(-1)).toMatchObject({ pingEveryone: true });
		});
	});

	it('answers in the reader language when the store has nothing to test with', async () => {
		sendTest.mockResolvedValue({ status: 'ok', outcome: 'no-offer' });
		render(screenOf(), { wrapper: Translated });

		await userEvent.click(screen.getByRole('button', { name: copy.test.action }));

		expect(toast.warning).toHaveBeenCalledWith(copy.test.noOffer);
	});

	it('warns when the test went out under the bot name instead of Tessera Gaming', async () => {
		sendTest.mockResolvedValue({ status: 'ok', outcome: 'sent-as-bot' });
		render(screenOf(), { wrapper: Translated });

		await userEvent.click(screen.getByRole('button', { name: copy.test.action }));

		expect(toast.warning).toHaveBeenCalledWith(copy.test.sentAsBot);
	});

	it('will not test a draft, because the test posts what is saved', async () => {
		render(screenOf(), { wrapper: Translated });

		await userEvent.click(screen.getByRole('switch', { name: copy.upcoming.label }));

		expect(screen.getByRole('button', { name: copy.test.action })).toBeDisabled();
	});
});
