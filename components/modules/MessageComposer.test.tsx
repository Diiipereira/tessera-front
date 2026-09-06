import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import type { EmbedField, MessageDraft } from '@/lib/types/modules';
import { Translated } from '@/tests/i18n';
import { MessageComposer } from './MessageComposer';

const FIELDS: EmbedField[] = [
	{ id: 'one', name: 'Rules', value: 'Read them', inline: false },
	{ id: 'two', name: 'Roles', value: 'Pick one', inline: false },
	{ id: 'three', name: 'Support', value: 'Open a ticket', inline: false }
];

const dataTransfer = {
	effectAllowed: '',
	dropEffect: '',
	setData: () => undefined,
	setDragImage: () => undefined
};

function Harness() {
	const [value, setValue] = useState<MessageDraft>({
		mode: 'embed',
		text: '',
		embed: {
			authorName: '',
			title: '',
			description: '',
			color: '#5865f2',
			fields: FIELDS,
			imageUrl: '',
			thumbnailUrl: '',
			footerText: '',
			timestamp: false
		}
	});

	return <MessageComposer value={value} onChange={setValue} variables={[]} />;
}

function renderComposer() {
	const view = render(
		<Translated locale="en-US">
			<Harness />
		</Translated>
	);

	return {
		rows: () => Array.from(view.container.querySelectorAll('[data-field-row]')),
		names: () =>
			screen.getAllByLabelText<HTMLInputElement>('Field name').map((input) => input.value)
	};
}

function handle(position: number, total = FIELDS.length) {
	return screen.getByRole('button', { name: `Move field ${String(position)} of ${String(total)}` });
}

describe('MessageComposer field order', () => {
	it('numbers every handle by where its field sits', () => {
		renderComposer();

		expect(
			screen
				.getAllByRole('button', { name: /^Move field/ })
				.map((entry) => entry.getAttribute('aria-label'))
		).toEqual(['Move field 1 of 3', 'Move field 2 of 3', 'Move field 3 of 3']);
	});

	it('drops a dragged field where it was released', () => {
		const composer = renderComposer();

		fireEvent.dragStart(handle(1), { dataTransfer });
		fireEvent.dragOver(composer.rows()[2] as HTMLElement, { dataTransfer });
		fireEvent.drop(composer.rows()[2] as HTMLElement, { dataTransfer });

		expect(composer.names()).toEqual(['Roles', 'Support', 'Rules']);
	});

	it('moves a field with the arrow keys, for whoever is not holding a mouse', async () => {
		const user = userEvent.setup();
		const composer = renderComposer();

		handle(3).focus();
		await user.keyboard('{ArrowUp}');

		expect(composer.names()).toEqual(['Rules', 'Support', 'Roles']);

		await user.keyboard('{ArrowDown}');

		expect(composer.names()).toEqual(['Rules', 'Roles', 'Support']);
	});

	it('offers the picture rules beside both image fields', async () => {
		const user = userEvent.setup();
		renderComposer();

		const help = screen.getAllByRole('button', { name: 'Help with images' });

		expect(help).toHaveLength(2);

		await user.click(help[0] as HTMLElement);

		expect(screen.getByText('How to add an image')).toBeInTheDocument();
		expect(screen.getByText(/expires within a day/)).toBeInTheDocument();
	});

	it('keeps the first and last fields put when they are pushed past the ends', async () => {
		const user = userEvent.setup();
		const composer = renderComposer();

		handle(1).focus();
		await user.keyboard('{ArrowUp}');

		expect(composer.names()).toEqual(['Rules', 'Roles', 'Support']);

		handle(3).focus();
		await user.keyboard('{ArrowDown}');

		expect(composer.names()).toEqual(['Rules', 'Roles', 'Support']);
	});
});
