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

		expect(channels).toEqual([{ id: '2', name: 'teste', category: 'Text channels', kind: 'text' }]);
	});

	it('keeps a channel that sits outside any category', () => {
		expect(toChannels([dto({ id: '2', type: 0, name: 'geral' })])[0]?.category).toBe(UNCATEGORISED);
	});

	it('does not offer the category itself as somewhere to post', () => {
		expect(toChannels([dto({ id: '1', type: 4, name: 'Text channels' })])).toEqual([]);
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
