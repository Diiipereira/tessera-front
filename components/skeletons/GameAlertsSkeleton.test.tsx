import { render, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GameAlertsScreen } from '@/app/(authenticated)/servers/[guildId]/(shell)/modules/game-alerts/GameAlertsScreen';
import { toGameAlertsConfig } from '@/lib/modules/game-alerts';
import { Translated } from '@/tests/i18n';
import { GameAlertsSkeleton } from './GameAlertsSkeleton';

vi.mock('@/lib/module-client', () => ({ patchModule: vi.fn() }));

vi.mock('@/lib/game-alerts-client', () => ({
	previewGameAlert: vi.fn(() => new Promise(() => undefined)),
	sendGameAlertTest: vi.fn()
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), warning: vi.fn(), error: vi.fn() } }));

const panels = (root: HTMLElement): number =>
	root.querySelectorAll('section:not([aria-label])').length;

const boxes = (root: HTMLElement, ...classes: string[]): number =>
	[...root.querySelectorAll('div')].filter((box) =>
		classes.every((name) => box.classList.contains(name))
	).length;

function renderBoth() {
	const skeleton = render(<GameAlertsSkeleton />).container;
	const page = render(
		<GameAlertsScreen
			guildId="931562055025168435"
			config={toGameAlertsConfig({ enabled: false, config: {} }, '#5865f2')}
			defaultColor="#5865f2"
			version={0}
			channels={[]}
			roles={[]}
			botName="Tessera Dev"
			botAvatarUrl={null}
			now="2026-09-11T12:00:00.000Z"
		/>,
		{ wrapper: Translated }
	).container;

	return { skeleton, page };
}

describe('GameAlertsSkeleton', () => {
	it('draws one panel per section the screen has', () => {
		const { skeleton, page } = renderBoth();

		expect(panels(skeleton)).toBe(panels(page));
	});

	it('draws every switch a new guild sees, the one in the header included', () => {
		const { skeleton, page } = renderBoth();

		expect(boxes(skeleton, 'h-5', 'w-9')).toBe(within(page).getAllByRole('switch').length);
	});

	it('opens on the embed builder, because a new guild has the card on', () => {
		const { skeleton, page } = renderBoth();

		expect(page.querySelectorAll('input[type="color"]')).toHaveLength(1);
		expect(boxes(skeleton, 'size-9')).toBe(1);
	});

	it('draws one chip per variable the composer offers', () => {
		const { skeleton, page } = renderBoth();

		expect(boxes(skeleton, 'h-6', 'rounded-sm')).toBe(
			within(page).getAllByRole('button', { name: /^\{\w+\}$/u }).length
		);
	});

	it('waits for the preview with the same card the route skeleton draws', () => {
		const { skeleton, page } = renderBoth();

		expect(boxes(page, 'h-40')).toBe(1);
		expect(boxes(skeleton, 'h-40')).toBe(1);
	});
});
