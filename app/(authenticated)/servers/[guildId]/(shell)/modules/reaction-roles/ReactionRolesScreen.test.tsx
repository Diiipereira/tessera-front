import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TooltipProvider } from '@/components/ui/tooltip-provider';
import type { Channel, Role } from '@/lib/types/discord';
import type { ReactionRolesConfig } from '@/lib/types/module-configs';
import { Translated } from '@/tests/i18n';
import { ReactionRolesScreen } from './ReactionRolesScreen';
import { emptyEmbedDraft } from '@/lib/modules/welcome';

vi.mock('@/lib/module-client', () => ({ patchModule: vi.fn() }));
vi.mock('@/lib/reaction-roles-client', () => ({ loadPanels: vi.fn(), savePanels: vi.fn() }));

vi.mock('sonner', () => ({
	toast: { success: () => undefined, error: () => undefined }
}));

const GUILD_ID = '931562055025168435';

const channels: Channel[] = [
	{
		id: '901234567890123001',
		name: 'cargos',
		categoryId: 'cat-1',
		category: 'Text channels',
		kind: 'text'
	}
];

const roles: Role[] = [
	{ id: '801234567890123001', name: 'Blue', color: '#5865f2' },
	{ id: '801234567890123002', name: 'Green', color: '#57f287' },
	{ id: '801234567890123003', name: 'Red', color: '#ed4245' }
];

const config: ReactionRolesConfig = {
	enabled: true,
	panels: [
		{
			id: 'panel-1',
			name: 'Colours',
			channelId: '901234567890123001',
			message: { mode: 'text', text: '', embed: emptyEmbedDraft() },
			mode: 'toggle',
			useButtons: true,
			options: [
				{ id: 'blue', emoji: '🔵', roleId: null, label: 'Blue', description: '' },
				{ id: 'green', emoji: '🟢', roleId: null, label: 'Green', description: '' },
				{ id: 'red', emoji: '🔴', roleId: null, label: 'Red', description: '' }
			]
		}
	]
};

function renderScreen() {
	const view = render(
		<Translated locale="en-US">
			<TooltipProvider>
				<ReactionRolesScreen
					guildId={GUILD_ID}
					config={config}
					version={1}
					defaultColor="#5865F2"
					botName="Tessera Dev"
					botAvatarUrl={null}
					channels={channels}
					roles={roles}
				/>
			</TooltipProvider>
		</Translated>
	);

	return {
		rows: () => Array.from(view.container.querySelectorAll('[data-option-row]')),
		labels: () => screen.getAllByLabelText<HTMLInputElement>('Label').map((input) => input.value)
	};
}

function handle(position: number) {
	return screen.getByRole('button', { name: `Move option ${String(position)} of 3` });
}

describe('ReactionRolesScreen option order', () => {
	it('drops a dragged option where it was released', () => {
		const screenUnderTest = renderScreen();

		fireEvent.dragStart(handle(3), {
			dataTransfer: { setData: () => undefined, setDragImage: () => undefined }
		});
		fireEvent.dragOver(screenUnderTest.rows()[0] as HTMLElement, { dataTransfer: {} });
		fireEvent.drop(screenUnderTest.rows()[0] as HTMLElement, { dataTransfer: {} });

		expect(screenUnderTest.labels()).toEqual(['Red', 'Blue', 'Green']);
	});

	it('moves an option with the arrow keys', async () => {
		const user = userEvent.setup();
		const screenUnderTest = renderScreen();

		handle(1).focus();
		await user.keyboard('{ArrowDown}');

		expect(screenUnderTest.labels()).toEqual(['Green', 'Blue', 'Red']);
	});

	it('keeps the ends put when they are pushed past the list', async () => {
		const user = userEvent.setup();
		const screenUnderTest = renderScreen();

		handle(1).focus();
		await user.keyboard('{ArrowUp}');

		expect(screenUnderTest.labels()).toEqual(['Blue', 'Green', 'Red']);
	});

	it('names the add button from the dictionary, in the language the screen is showing', () => {
		renderScreen();

		expect(screen.getByRole('button', { name: 'Add option' })).toBeInTheDocument();
	});
});
