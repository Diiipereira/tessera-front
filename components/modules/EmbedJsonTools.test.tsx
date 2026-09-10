import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { emptyEmbedDraft } from '@/lib/modules/welcome';
import enUS from '@/messages/en-US.json';
import { Translated } from '@/tests/i18n';
import type { EmbedDraft } from '@/lib/types/modules';
import { EmbedJsonTools } from './EmbedJsonTools';

const copy = enUS.embeds.json;

const BLUE = '#5865f2';

const draft = (patch: Partial<EmbedDraft> = {}): EmbedDraft => ({
	...emptyEmbedDraft(BLUE),
	...patch
});

const boxOf = (): HTMLTextAreaElement => screen.getByLabelText(copy.label);

describe('EmbedJsonTools', () => {
	it('writes the current embed into the box when it is copied', async () => {
		render(
			<EmbedJsonTools embed={draft({ title: 'Rules' })} defaultColor={BLUE} onApply={vi.fn()} />,
			{ wrapper: Translated }
		);

		await userEvent.click(screen.getByRole('button', { name: copy.copy }));

		expect(boxOf().value).toContain('"title": "Rules"');
	});

	it('cannot apply an empty box', () => {
		render(<EmbedJsonTools embed={draft()} defaultColor={BLUE} onApply={vi.fn()} />, {
			wrapper: Translated
		});

		expect(screen.getByRole('button', { name: copy.apply })).toBeDisabled();
	});

	it('hands the screen the embed that was pasted', async () => {
		const onApply = vi.fn();

		render(<EmbedJsonTools embed={draft()} defaultColor={BLUE} onApply={onApply} />, {
			wrapper: Translated
		});

		await userEvent.click(boxOf());
		await userEvent.paste('{"title":"Rules","color":16711680}');
		await userEvent.click(screen.getByRole('button', { name: copy.apply }));

		expect(onApply).toHaveBeenCalledWith(
			expect.objectContaining({ title: 'Rules', color: '#ff0000' })
		);
	});

	it('keeps the screen untouched when the paste is not JSON', async () => {
		const onApply = vi.fn();

		render(<EmbedJsonTools embed={draft()} defaultColor={BLUE} onApply={onApply} />, {
			wrapper: Translated
		});

		await userEvent.click(boxOf());
		await userEvent.paste('not json at all');
		await userEvent.click(screen.getByRole('button', { name: copy.apply }));

		expect(onApply).not.toHaveBeenCalled();
	});
});
