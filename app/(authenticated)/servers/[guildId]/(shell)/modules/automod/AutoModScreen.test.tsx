import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import enUS from '@/messages/en-US.json';
import { mockAutoModConfig } from '@/lib/mock/module-configs';
import type { Channel, Role } from '@/lib/types/discord';
import { Translated } from '@/tests/i18n';
import { AutoModScreen } from './AutoModScreen';

const testMessage = vi.fn();

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() } }));

vi.mock('@/lib/module-client', () => ({ patchModule: vi.fn() }));

vi.mock('@/lib/automod-client', () => ({
	saveRules: vi.fn(),
	testMessage: (...args: unknown[]) => testMessage(...args) as unknown
}));

const channels: Channel[] = [
	{ id: '111111111111111111', name: 'geral', categoryId: null, category: 'Chat', kind: 'text' }
];

const roles: Role[] = [{ id: '222222222222222222', name: 'Staff', color: '#5865f2' }];

const copy = enUS.modules.automod.playground;

function paint() {
	return render(
		<AutoModScreen
			guildId="931562055025168435"
			config={mockAutoModConfig}
			version={3}
			channels={channels}
			roles={roles}
		/>,
		{ wrapper: Translated }
	);
}

describe('the automod playground', () => {
	it('opens empty, with the example offered rather than typed in for you', () => {
		paint();

		const box = screen.getByLabelText(copy.sample);

		expect(box).toHaveValue('');
		expect(box).toHaveAttribute('placeholder', copy.placeholder);
	});

	it('says nothing is being tested yet, instead of claiming an empty message would pass', () => {
		paint();

		expect(screen.getByText(copy.waiting)).toBeInTheDocument();
		expect(screen.queryByText(copy.clear)).not.toBeInTheDocument();
	});

	it('asks the API nothing while the box is empty', async () => {
		vi.useFakeTimers();
		paint();

		await vi.advanceTimersByTimeAsync(2_000);
		vi.useRealTimers();

		expect(testMessage).not.toHaveBeenCalled();
	});

	it('starts reading once a message is actually typed', async () => {
		const user = userEvent.setup();
		testMessage.mockResolvedValue({ status: 'ok', reading: { fired: [], untestable: [] } });
		paint();

		await user.type(screen.getByLabelText(copy.sample), 'oi');

		expect(screen.queryByText(copy.waiting)).not.toBeInTheDocument();
	});
});
