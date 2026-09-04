import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TooltipProvider } from '@/components/ui/tooltip-provider';
import { emptyEmbedDraft, welcomeVariables } from '@/lib/modules/welcome';
import type { Channel, Role } from '@/lib/types/discord';
import type { WelcomeConfig } from '@/lib/types/modules';
import { Translated } from '@/tests/i18n';
import { WelcomeScreen } from '@/app/(authenticated)/servers/[guildId]/(shell)/modules/welcome/WelcomeScreen';
import { WelcomeSkeleton } from './WelcomeSkeleton';

vi.mock('@/lib/module-client', () => ({ patchModule: vi.fn() }));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const channels: Channel[] = [
	{
		id: '901234567890123001',
		name: 'geral',
		categoryId: null,
		category: 'No category',
		kind: 'text'
	}
];

const roles: Role[] = [{ id: '801234567890123001', name: 'Member', color: '#57f287' }];

const fresh: WelcomeConfig = {
	enabled: true,
	channelId: null,
	message: { mode: 'text', text: '', embed: emptyEmbedDraft() },
	autoRoleIds: [],
	pingMode: 'none',
	deleteAfter: null
};

const panels = (root: HTMLElement): number =>
	root.querySelectorAll('section:not([aria-label])').length;

const boxes = (root: HTMLElement, ...classes: string[]): number =>
	[...root.querySelectorAll('div')].filter((box) =>
		classes.every((name) => box.classList.contains(name))
	).length;

function renderScreen() {
	return render(
		<TooltipProvider>
			<WelcomeScreen
				guildId="931562055025168435"
				config={fresh}
				defaultColor="#eb459e"
				version={1}
				channels={channels}
				roles={roles}
				variables={welcomeVariables('Tessera Dev')}
			/>
		</TooltipProvider>,
		{ wrapper: Translated }
	);
}

describe('WelcomeSkeleton', () => {
	it('draws one panel per section the screen has', () => {
		const skeleton = render(<WelcomeSkeleton />).container;
		const screen = renderScreen().container;

		expect(panels(skeleton)).toBe(panels(screen));
	});

	it('draws one switch, because the screen only toggles the module', () => {
		const skeleton = render(<WelcomeSkeleton />).container;

		expect(boxes(skeleton, 'h-5', 'w-9')).toBe(1);
	});

	it('stands in for the message box the screen opens with, not the embed builder', () => {
		const skeleton = render(<WelcomeSkeleton />).container;

		expect(boxes(skeleton, 'h-19')).toBe(0);
	});
});
