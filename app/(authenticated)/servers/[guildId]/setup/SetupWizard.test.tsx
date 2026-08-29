import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { SUPPORTED_LOCALES } from '@/lib/locale';
import type { Channel, Role } from '@/lib/types/discord';
import type { Guild } from '@/lib/types/guild';
import enUS from '@/messages/en-US.json';
import { Translated } from '@/tests/i18n';
import { SetupWizard } from './SetupWizard';

const GUILD: Guild = {
	id: '842315097461823104',
	name: 'Comunidade CJ GAMES',
	initials: 'CG',
	color: '#5865f2',
	iconUrl: null,
	memberCount: 12431,
	hasBot: true,
	reachedBySeat: false,
	tier: 'free',
	missingPermissions: []
};

const CHANNELS: Channel[] = [
	{ id: '1', name: 'general', categoryId: 'cat-1', category: 'Text', kind: 'text' }
];

const ROLES: Role[] = [{ id: '2', name: 'Moderator', color: '#5865f2' }];

async function openLanguages() {
	const user = userEvent.setup();

	render(
		<Translated>
			<SetupWizard guild={GUILD} channels={CHANNELS} roles={ROLES} />
		</Translated>
	);

	await user.tab();
	await user.click(screen.getByRole('combobox', { name: enUS.setup.basics.language }));

	return screen.findAllByRole('option');
}

describe('SetupWizard', () => {
	it('offers only the locales the API accepts, so the first step cannot write a value that fails', async () => {
		const options = await openLanguages();

		expect(options.map((option) => option.textContent)).toEqual(
			SUPPORTED_LOCALES.map((locale) => enUS.locales[locale])
		);
	});
});
