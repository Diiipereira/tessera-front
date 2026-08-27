import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { emptyEmbedDraft, welcomeVariables } from '@/lib/modules/welcome';
import type { MessageDraft } from '@/lib/types/modules';
import { DiscordPreview } from './DiscordPreview';

const IMAGE = 'https://cdn.discordapp.com/attachments/1/2/banner.png';
const THUMB = 'https://cdn.discordapp.com/attachments/1/2/icon.png';

const variables = welcomeVariables('Tessera Dev');

const embedDraft = (over: Partial<MessageDraft['embed']> = {}): MessageDraft => ({
	mode: 'embed',
	text: '',
	embed: { ...emptyEmbedDraft(), ...over }
});

describe('DiscordPreview images', () => {
	it('renders the picture instead of printing its address', () => {
		render(
			<DiscordPreview
				message={embedDraft({ title: 'Hi', imageUrl: IMAGE })}
				variables={variables}
			/>
		);

		expect(screen.getByRole('presentation')).toHaveAttribute('src', IMAGE);
		expect(screen.queryByText(/image: https/)).not.toBeInTheDocument();
	});

	it('shows both the wide image and the thumbnail', () => {
		render(
			<DiscordPreview
				message={embedDraft({ title: 'Hi', imageUrl: IMAGE, thumbnailUrl: THUMB })}
				variables={variables}
			/>
		);

		const sources = screen.getAllByRole('presentation').map((node) => node.getAttribute('src'));

		expect(sources).toContain(IMAGE);
		expect(sources).toContain(THUMB);
	});

	it('says so when the address does not load, rather than leaving a broken icon', () => {
		render(
			<DiscordPreview
				message={embedDraft({ title: 'Hi', imageUrl: IMAGE })}
				variables={variables}
			/>
		);

		fireEvent.error(screen.getByRole('presentation'));

		expect(screen.getByText(/will not be able to show this image/)).toBeInTheDocument();
	});

	it('counts an image alone as content, the same way the bot does', () => {
		render(<DiscordPreview message={embedDraft({ imageUrl: IMAGE })} variables={variables} />);

		expect(screen.queryByText(/The embed is empty/)).not.toBeInTheDocument();
	});

	it('still calls an embed with nothing in it empty', () => {
		render(<DiscordPreview message={embedDraft()} variables={variables} />);

		expect(screen.getByText(/The embed is empty/)).toBeInTheDocument();
	});
});
