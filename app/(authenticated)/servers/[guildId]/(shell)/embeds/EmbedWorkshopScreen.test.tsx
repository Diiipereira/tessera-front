import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import enUS from '@/messages/en-US.json';
import { Translated } from '@/tests/i18n';
import type { Channel } from '@/lib/types/discord';
import { EmbedWorkshopScreen } from './EmbedWorkshopScreen';

const send = vi.hoisted(() => vi.fn());

vi.mock('@/lib/embeds-client', () => ({ sendEmbed: send }));

const copy = enUS.embeds;

const composer = enUS.modules.composer;

const channels: Channel[] = [
	{ id: '111111111111111111', name: 'general', kind: 'text', categoryId: null, category: null }
];

const workshop = (): React.ReactElement => (
	<EmbedWorkshopScreen
		guildId="931562055025168435"
		channels={channels}
		defaultColor="#5865f2"
		botName="Tessera Dev"
		botAvatarUrl={null}
	/>
);

describe('EmbedWorkshopScreen', () => {
	beforeEach(() => {
		send.mockReset();
		send.mockResolvedValue({ status: 'ok', outcome: 'sent' });
	});

	it('opens on the embed, because that is what the screen is for', () => {
		render(workshop(), { wrapper: Translated });

		expect(screen.getByRole('button', { name: composer.embed })).toHaveAttribute(
			'aria-pressed',
			'true'
		);
	});

	it('cannot post before a channel is chosen', () => {
		render(workshop(), { wrapper: Translated });

		expect(screen.getByRole('button', { name: copy.send.action })).toBeDisabled();
	});

	it('offers no variables, because nothing is substituted in a one-off post', () => {
		render(workshop(), { wrapper: Translated });

		expect(screen.queryByText(enUS.modules.variables.insert)).not.toBeInTheDocument();
	});

	it('posts what was typed, into the channel that was picked', async () => {
		render(workshop(), { wrapper: Translated });

		await userEvent.type(screen.getByLabelText(composer.title), 'Rules');
		await userEvent.click(screen.getByRole('button', { name: enUS.pickers.channel }));
		await userEvent.click(screen.getByRole('button', { name: 'general' }));
		await userEvent.click(screen.getByRole('button', { name: copy.send.action }));

		expect(send).toHaveBeenCalledWith(
			'931562055025168435',
			expect.objectContaining({
				channelId: '111111111111111111',
				content: '',
				embed: expect.objectContaining({ title: 'Rules' }) as unknown
			})
		);
	});

	it('sends the text instead of the embed when the text is what is being written', async () => {
		render(workshop(), { wrapper: Translated });

		await userEvent.click(screen.getByRole('button', { name: composer.text }));
		await userEvent.type(screen.getByLabelText(composer.messageLabel), 'Read this');
		await userEvent.click(screen.getByRole('button', { name: enUS.pickers.channel }));
		await userEvent.click(screen.getByRole('button', { name: 'general' }));
		await userEvent.click(screen.getByRole('button', { name: copy.send.action }));

		expect(send).toHaveBeenCalledWith(
			'931562055025168435',
			expect.objectContaining({ content: 'Read this', embed: {} })
		);
	});
});
