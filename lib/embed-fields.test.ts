import { describe, expect, it } from 'vitest';
import { toFieldRows } from './embed-fields';
import type { EmbedField } from '@/lib/types/modules';

const field = (id: string, inline: boolean): EmbedField => ({
	id,
	name: id,
	value: id,
	inline
});

const shape = (fields: EmbedField[]) => toFieldRows(fields).map((row) => row.map((one) => one.id));

describe('toFieldRows', () => {
	it('gives every field its own row while none of them is inline', () => {
		expect(shape([field('a', false), field('b', false)])).toEqual([['a'], ['b']]);
	});

	it('puts neighbouring inline fields on the same row', () => {
		expect(shape([field('a', true), field('b', true)])).toEqual([['a', 'b']]);
	});

	it('breaks a run after three, because that is the widest row Discord draws', () => {
		expect(shape([field('a', true), field('b', true), field('c', true), field('d', true)])).toEqual(
			[['a', 'b', 'c'], ['d']]
		);
	});

	it('lets a field that is not inline end the run it interrupts', () => {
		expect(
			shape([field('a', true), field('b', false), field('c', true), field('d', true)])
		).toEqual([['a'], ['b'], ['c', 'd']]);
	});

	it('leaves a lone inline field alone on its row, where it reads the same as any other', () => {
		expect(shape([field('a', true)])).toEqual([['a']]);
	});

	it('returns nothing for an embed without fields', () => {
		expect(toFieldRows([])).toEqual([]);
	});
});
