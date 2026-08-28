import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { emptyEmbedDraft, welcomeVariables } from '@/lib/modules/welcome';
import enUS from '@/messages/en-US.json';
import { Translated } from '@/tests/i18n';
import type { MessageDraft } from '@/lib/types/modules';
import { DiscordPreview } from './DiscordPreview';

const IMAGE = 'https://cdn.discordapp.com/attachments/1/2/banner.png';
const THUMB = 'https://cdn.discordapp.com/attachments/1/2/icon.png';

const copy = enUS.modules.preview;

const variables = welcomeVariables('Tessera Dev');

const embedDraft = (over: Partial<MessageDraft['embed']> = {}): MessageDraft => ({
	mode: 'embed',
	text: '',
	embed: { ...emptyEmbedDraft(), ...over }
});

const show = (message: MessageDraft) =>
	render(<DiscordPreview message={message} variables={variables} />, { wrapper: Translated });

describe('DiscordPreview images', () => {
	it('renders the picture instead of printing its address', () => {
		show(embedDraft({ title: 'Hi', imageUrl: IMAGE }));

		expect(screen.getByRole('presentation')).toHaveAttribute('src', IMAGE);
		expect(screen.queryByText(/image: https/)).not.toBeInTheDocument();
	});

	it('shows both the wide image and the thumbnail', () => {
		show(embedDraft({ title: 'Hi', imageUrl: IMAGE, thumbnailUrl: THUMB }));

		const sources = screen.getAllByRole('presentation').map((node) => node.getAttribute('src'));

		expect(sources).toContain(IMAGE);
		expect(sources).toContain(THUMB);
	});

	it('says so when the address does not load, rather than leaving a broken icon', () => {
		show(embedDraft({ title: 'Hi', imageUrl: IMAGE }));

		fireEvent.error(screen.getByRole('presentation'));

		expect(screen.getByText(copy.imageUnavailable)).toBeInTheDocument();
	});

	it('keeps the thumbnail box when the thumbnail fails, so the text beside it is not crushed', () => {
		show(embedDraft({ title: 'Hi', description: 'Some words', thumbnailUrl: THUMB }));

		const image = screen.getByRole('presentation');
		const frame = ['size-20', 'shrink-0'];

		expect(frame.every((token) => image.classList.contains(token))).toBe(true);

		fireEvent.error(image);

		const fallback = screen.getByText(copy.imageUnavailable);

		expect(frame.every((token) => fallback.classList.contains(token))).toBe(true);
	});

	it('counts an image alone as content, the same way the bot does', () => {
		show(embedDraft({ imageUrl: IMAGE }));

		expect(screen.queryByText(copy.embedEmpty)).not.toBeInTheDocument();
	});

	it('still calls an embed with nothing in it empty', () => {
		show(embedDraft());

		expect(screen.getByText(copy.embedEmpty)).toBeInTheDocument();
	});

	it('speaks the reader language, not English by default', () => {
		render(<DiscordPreview message={embedDraft()} variables={variables} />, {
			wrapper: ({ children }) => <Translated locale="pt-BR">{children}</Translated>
		});

		expect(screen.getByText(/O embed está vazio/)).toBeInTheDocument();
	});
});
