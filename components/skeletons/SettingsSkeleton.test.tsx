import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SettingsScreen } from '@/app/(authenticated)/servers/[guildId]/(shell)/settings/SettingsScreen';
import type { GuildSettings } from '@/lib/types/management';
import { Translated } from '@/tests/i18n';
import { SettingsSkeleton } from './SettingsSkeleton';

vi.mock('@/lib/settings-client', () => ({ patchSettings: vi.fn() }));

vi.mock('@/lib/guild-bot-client', () => ({ removeBot: vi.fn(), resetAllModules: vi.fn() }));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }) }));

const SETTINGS: GuildSettings = {
	locale: 'en-US',
	timezone: 'America/Sao_Paulo',
	embedColor: '#5865f2',
	botNickname: ''
};

const panels = (root: HTMLElement): number =>
	root.querySelectorAll('section:not([aria-label])').length;

const circles = (root: HTMLElement): number => root.querySelectorAll('.rounded-full').length;

function renderScreen() {
	return render(
		<SettingsScreen
			guildId="931562055025168435"
			settings={SETTINGS}
			guildName="Tessera Dev"
			botAvatarUrl={null}
		/>,
		{ wrapper: Translated }
	);
}

describe('SettingsSkeleton', () => {
	it('draws one panel per section the screen has', () => {
		const skeleton = render(<SettingsSkeleton />).container;
		const screen = renderScreen().container;

		expect(panels(skeleton)).toBe(panels(screen));
	});

	it('stands in for the round picture the screen opens with', () => {
		const skeleton = render(<SettingsSkeleton />).container;

		expect(circles(skeleton)).toBeGreaterThan(0);
	});
});
