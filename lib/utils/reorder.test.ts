import { describe, expect, it } from 'vitest';
import { moveItem } from './reorder';

describe('moveItem', () => {
	it('drops the item at the destination and closes the gap behind it', () => {
		expect(moveItem(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
		expect(moveItem(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c']);
	});

	it('leaves the list alone when the move goes nowhere', () => {
		expect(moveItem(['a', 'b', 'c'], 1, 1)).toEqual(['a', 'b', 'c']);
	});

	it('refuses to move past either end, so the first and last items stay put', () => {
		expect(moveItem(['a', 'b', 'c'], 0, -1)).toEqual(['a', 'b', 'c']);
		expect(moveItem(['a', 'b', 'c'], 2, 3)).toEqual(['a', 'b', 'c']);
	});

	it('ignores an index that names nothing', () => {
		expect(moveItem(['a', 'b'], 5, 0)).toEqual(['a', 'b']);
	});

	it('never mutates the list it was given', () => {
		const items = ['a', 'b', 'c'];

		expect(moveItem(items, 0, 2)).not.toBe(items);
		expect(items).toEqual(['a', 'b', 'c']);
	});
});
