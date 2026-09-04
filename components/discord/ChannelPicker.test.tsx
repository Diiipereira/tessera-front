import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Channel, ChannelKind } from '@/lib/types/discord';
import { Translated } from '@/tests/i18n';
import { ChannelPicker } from './ChannelPicker';

const channel = (over: Partial<Channel> & { id: string; name: string }): Channel => ({
	categoryId: null,
	category: 'No category',
	kind: 'text',
	...over
});

async function open(channels: Channel[], kinds?: readonly ChannelKind[]) {
	const user = userEvent.setup();

	render(
		<Translated>
			<ChannelPicker channels={channels} kinds={kinds} onValueChange={vi.fn()} />
		</Translated>
	);

	await user.click(screen.getByRole('button'));

	return user;
}

const headings = (): string[] =>
	[...document.querySelectorAll('.font-mono.uppercase')].map((node) => node.textContent);

describe('ChannelPicker', () => {
	it('gathers a category into one section even when its channels arrive apart', async () => {
		await open([
			channel({ id: '1', name: 'regras', categoryId: 'a', category: 'Informações' }),
			channel({ id: '2', name: 'geral', categoryId: 'b', category: 'Comunidade' }),
			channel({ id: '3', name: 'avisos', categoryId: 'a', category: 'Informações' })
		]);

		expect(headings()).toEqual(['Informações', 'Comunidade']);
	});

	it('keeps two categories apart when Discord let them share a name', async () => {
		await open([
			channel({ id: '1', name: 'regras', categoryId: 'a', category: 'Informações' }),
			channel({ id: '2', name: 'avisos', categoryId: 'b', category: 'Informações' })
		]);

		expect(headings()).toEqual(['Informações', 'Informações']);
		expect(screen.getByRole('button', { name: 'regras' })).toBeDefined();
		expect(screen.getByRole('button', { name: 'avisos' })).toBeDefined();
	});

	it('leaves the categories out of a picker that did not ask for them', async () => {
		await open([
			channel({ id: '1', name: 'geral', kind: 'text' }),
			channel({ id: '2', name: 'Informações', kind: 'category' })
		]);

		expect(screen.getByRole('button', { name: 'geral' })).toBeDefined();
		expect(screen.queryByRole('button', { name: 'Informações' })).toBeNull();
	});

	it('offers the categories to a picker that asks for nothing else', async () => {
		await open(
			[
				channel({ id: '1', name: 'geral', kind: 'text' }),
				channel({ id: '2', name: 'Suporte', kind: 'category' })
			],
			['category']
		);

		expect(screen.getByRole('button', { name: 'Suporte' })).toBeDefined();
		expect(screen.queryByRole('button', { name: 'geral' })).toBeNull();
	});

	it('offers only the kinds the caller can post to', async () => {
		await open(
			[
				channel({ id: '1', name: 'geral', kind: 'text' }),
				channel({ id: '2', name: 'anuncios', kind: 'announcement' }),
				channel({ id: '3', name: 'teste', kind: 'voice' }),
				channel({ id: '4', name: 'ajuda', kind: 'forum' })
			],
			['text', 'announcement']
		);

		expect(screen.getByRole('button', { name: 'geral' })).toBeDefined();
		expect(screen.getByRole('button', { name: 'anuncios' })).toBeDefined();
		expect(screen.queryByRole('button', { name: 'teste' })).toBeNull();
		expect(screen.queryByRole('button', { name: 'ajuda' })).toBeNull();
	});

	it('offers every channel when the caller names no kinds', async () => {
		await open([
			channel({ id: '1', name: 'geral', kind: 'text' }),
			channel({ id: '2', name: 'teste', kind: 'voice' })
		]);

		expect(screen.getByRole('button', { name: 'teste' })).toBeDefined();
	});

	it('groups every uncategorised channel together', async () => {
		await open([
			channel({ id: '1', name: 'solto-um' }),
			channel({ id: '2', name: 'dentro', categoryId: 'a', category: 'Informações' }),
			channel({ id: '3', name: 'solto-dois' })
		]);

		expect(headings()).toEqual(['No category', 'Informações']);
	});
});
