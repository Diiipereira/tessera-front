import { describe, expect, it } from 'vitest';
import { channelSwitch } from '@/lib/channel-switch';
import type { Channel } from '@/lib/types/discord';

const channel = (id: string, name: string): Channel => ({
	id,
	name,
	categoryId: null,
	category: 'General',
	kind: 'text'
});

const CHANNELS = [channel('1', 'boas-vindas'), channel('2', 'regras')];

describe('what changes when the welcome channel changes', () => {
	it('says nothing while the draft still matches what is saved', () => {
		expect(channelSwitch('1', '1', CHANNELS)).toEqual({ kind: 'none' });
	});

	it('says nothing when neither the saved nor the draft has a channel', () => {
		expect(channelSwitch(null, null, CHANNELS)).toEqual({ kind: 'none' });
	});

	it('names only the channel arriving on a first configuration', () => {
		expect(channelSwitch(null, '2', CHANNELS)).toEqual({ kind: 'first', to: 'regras' });
	});

	it('names both sides when one channel replaces another', () => {
		expect(channelSwitch('1', '2', CHANNELS)).toEqual({
			kind: 'moved',
			from: 'boas-vindas',
			to: 'regras'
		});
	});

	it('says the old channel stops when the picker is emptied', () => {
		expect(channelSwitch('1', null, CHANNELS)).toEqual({ kind: 'cleared', from: 'boas-vindas' });
	});

	it('falls back to the id for a channel the picker never listed', () => {
		expect(channelSwitch(null, '404', CHANNELS)).toEqual({ kind: 'first', to: '404' });
	});
});
