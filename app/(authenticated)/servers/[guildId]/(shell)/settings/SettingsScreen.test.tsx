import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { GuildSettings } from '@/lib/types/management';
import { SettingsScreen } from './SettingsScreen';

vi.mock('@/lib/settings-client', () => ({
	patchSettings: vi.fn()
}));

const SETTINGS: GuildSettings = {
	locale: 'pt-BR',
	timezone: 'America/Sao_Paulo',
	embedColor: '#5865f2',
	botNickname: 'Tessera'
};

const UNBUILT = ['Export', 'Import', 'Reset', 'Remove bot'];

function setup() {
	render(
		<SettingsScreen
			guildId="842315097461823104"
			settings={SETTINGS}
			guildName="Comunidade CJ GAMES"
		/>
	);
}

describe('SettingsScreen', () => {
	it.each(UNBUILT)('keeps %s disabled while no API can carry it out', (name) => {
		setup();

		expect(screen.getByRole('button', { name })).toBeDisabled();
	});

	it('says which actions are missing instead of pretending they ran', () => {
		setup();

		expect(screen.getAllByText('Not available yet')).toHaveLength(UNBUILT.length);
	});

	it('leaves the settings that do save alone', () => {
		setup();

		expect(screen.getByDisplayValue('Tessera')).toBeEnabled();
		expect(screen.getByDisplayValue('#5865f2')).toBeEnabled();
		expect(screen.getByRole('button', { name: 'Use #5865f2' })).toBeEnabled();
	});
});
