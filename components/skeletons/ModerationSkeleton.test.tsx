import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ModerationScreen } from '@/app/(authenticated)/servers/[guildId]/(shell)/modules/moderation/ModerationScreen';
import type { ModerationConfig } from '@/lib/modules/moderation';
import type { Channel, Role } from '@/lib/types/discord';
import { Translated } from '@/tests/i18n';
import { ModerationSkeleton } from './ModerationSkeleton';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('@/lib/module-client', () => ({ patchModule: vi.fn() }));

vi.mock('@/lib/escalation-client', () => ({
	loadLadder: () => Promise.resolve({ status: 'ok', ladder: { rules: [], windowDays: 30 } }),
	addRule: vi.fn(),
	removeRule: vi.fn()
}));

const channels: Channel[] = [
	{ id: '111111111111111111', name: 'mod-log', categoryId: null, category: 'Staff', kind: 'text' }
];

const roles: Role[] = [{ id: '222222222222222222', name: 'Staff', color: '#5865f2' }];

const config: ModerationConfig = {
	enabled: true,
	logChannelId: null,
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
	escalationAutoActions: [],
	escalationWindowDays: 30
};

const panels = (root: HTMLElement): number =>
	root.querySelectorAll('section:not([aria-label])').length;

const columns = (root: HTMLElement): number => root.querySelectorAll('.lg\\:grid-cols-3').length;

function renderScreen() {
	return render(
		<ModerationScreen
			guildId="842315097461823104"
			guildName="Tessera Dev"
			config={config}
			version={4}
			channels={channels}
			roles={roles}
		/>,
		{ wrapper: Translated }
	);
}

describe('ModerationSkeleton', () => {
	it('draws one panel per section the screen has', () => {
		const skeleton = render(<ModerationSkeleton />).container;
		const screen = renderScreen().container;

		expect(panels(skeleton)).toBe(panels(screen));
	});

	it('lays the defaults out in the row the screen opens with, not stacked', () => {
		const skeleton = render(<ModerationSkeleton />).container;
		const screen = renderScreen().container;

		expect(columns(skeleton)).toBe(columns(screen));
		expect(columns(skeleton)).toBeGreaterThan(0);
	});
});
