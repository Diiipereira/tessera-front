import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BRAND } from '@/lib/brand';
import { emptyEmbedDraft, welcomeVariables } from '@/lib/modules/welcome';
import enUS from '@/messages/en-US.json';
import { Translated } from '@/tests/i18n';
import type { MessageDraft } from '@/lib/types/modules';
import { MessagePreview } from './MessagePreview';

const copy = enUS.modules.preview;

const variables = welcomeVariables('Tessera Dev');

const message: MessageDraft = {
	mode: 'embed',
	text: '',
	embed: { ...emptyEmbedDraft(), title: 'Level up' }
};

describe('MessagePreview', () => {
	it('says the data is a sample, so nobody reads the preview as a record', () => {
		render(<MessagePreview message={message} variables={variables} />, { wrapper: Translated });

		expect(screen.getByText(copy.note)).toBeInTheDocument();
	});

	it('takes a note of its own when the screen has something better to say', () => {
		render(
			<MessagePreview message={message} variables={variables} note="Sai quando alguém sobe" />,
			{
				wrapper: Translated
			}
		);

		expect(screen.getByText('Sai quando alguém sobe')).toBeInTheDocument();
		expect(screen.queryByText(copy.note)).not.toBeInTheDocument();
	});

	it('shows the bot the guild actually sees, not the brand name', () => {
		render(<MessagePreview message={message} variables={variables} botName="Tessera Dev" />, {
			wrapper: Translated
		});

		expect(screen.getByText('Tessera Dev')).toBeInTheDocument();
		expect(screen.queryByText(BRAND.botName)).not.toBeInTheDocument();
	});
});
