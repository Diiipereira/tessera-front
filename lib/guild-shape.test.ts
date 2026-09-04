import { describe, expect, it } from 'vitest';
import type { GuildChannelDto } from '@/lib/api-url';
import { UNCATEGORISED, toChannels } from './guild-shape';

const dto = (over: Partial<GuildChannelDto> & { id: string; type: number }): GuildChannelDto => ({
	name: 'channel',
	parentId: null,
	...over
});

describe('toChannels', () => {
	it('names each channel after the category it sits in', () => {
		const channels = toChannels([
			dto({ id: '1', type: 4, name: 'Text channels' }),
			dto({ id: '2', type: 0, name: 'teste', parentId: '1' })
		]);

		expect(channels.find((channel) => channel.kind === 'text')).toEqual({
			id: '2',
			name: 'teste',
			categoryId: '1',
			category: 'Text channels',
			kind: 'text'
		});
	});

	it('carries the category id, which is what stays unique when two share a name', () => {
		const channels = toChannels([
			dto({ id: '1', type: 4, name: 'Informações' }),
			dto({ id: '2', type: 4, name: 'Informações' }),
			dto({ id: '3', type: 0, name: 'regras', parentId: '1' }),
			dto({ id: '4', type: 0, name: 'avisos', parentId: '2' })
		]);

		const inside = channels.filter((channel) => channel.kind === 'text');

		expect(inside.map((channel) => channel.category)).toEqual(['Informações', 'Informações']);
		expect(inside.map((channel) => channel.categoryId)).toEqual(['1', '2']);
	});

	it('keeps a channel that sits outside any category', () => {
		const [channel] = toChannels([dto({ id: '2', type: 0, name: 'geral' })]);

		expect(channel?.category).toBe(UNCATEGORISED);
		expect(channel?.categoryId).toBeNull();
	});

	it('keeps the category itself, since a ticket panel has to pick one', () => {
		expect(toChannels([dto({ id: '1', type: 4, name: 'Text channels' })])).toEqual([
			{
				id: '1',
				name: 'Text channels',
				categoryId: null,
				category: UNCATEGORISED,
				kind: 'category'
			}
		]);
	});

	it('drops kinds the pickers cannot render instead of guessing an icon', () => {
		expect(toChannels([dto({ id: '9', type: 13, name: 'stage' })])).toEqual([]);
	});

	it('maps every kind the picker knows', () => {
		const channels = toChannels([
			dto({ id: '1', type: 0 }),
			dto({ id: '2', type: 2 }),
			dto({ id: '3', type: 5 }),
			dto({ id: '4', type: 15 })
		]);

		expect(channels.map((channel) => channel.kind)).toEqual([
			'text',
			'voice',
			'announcement',
			'forum'
		]);
	});

	it('falls back when a channel points at a category that did not come back', () => {
		expect(toChannels([dto({ id: '2', type: 0, parentId: 'gone' })])[0]?.category).toBe(
			UNCATEGORISED
		);
	});
});
