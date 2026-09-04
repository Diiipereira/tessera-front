import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { deepEqual, useConfigDraft, type SaveOutcome, type SaveState } from './useConfigDraft';

type Config = {
	enabled: boolean;
	channelId: string | null;
	roleIds: string[];
	message: { mode: string; text: string };
};

const initial: Config = {
	enabled: true,
	channelId: 'c1',
	roleIds: ['r1'],
	message: { mode: 'text', text: 'hi' }
};

describe('deepEqual', () => {
	it('treats structurally equal objects as equal', () => {
		expect(deepEqual({ a: 1, b: { c: [1, 2] } }, { a: 1, b: { c: [1, 2] } })).toBe(true);
	});

	it('separates arrays that differ only in order', () => {
		expect(deepEqual(['a', 'b'], ['b', 'a'])).toBe(false);
	});

	it('does not call an object with extra keys equal', () => {
		expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
	});

	it('handles null without throwing', () => {
		expect(deepEqual(null, { a: 1 })).toBe(false);
		expect(deepEqual(null, null)).toBe(true);
	});
});

describe('useConfigDraft', () => {
	it('starts clean', () => {
		const { result } = renderHook(() => useConfigDraft(initial));
		expect(result.current.dirty).toBe(false);
		expect(result.current.changedCount).toBe(0);
	});

	it('goes dirty and counts one changed setting', () => {
		const { result } = renderHook(() => useConfigDraft(initial));

		act(() => {
			result.current.set('channelId', 'c2');
		});

		expect(result.current.dirty).toBe(true);
		expect(result.current.changedCount).toBe(1);
		expect(result.current.changedKeys).toEqual(['channelId']);
	});

	it('sees a change nested inside an object', () => {
		const { result } = renderHook(() => useConfigDraft(initial));

		act(() => {
			result.current.set('message', { mode: 'text', text: 'hello' });
		});

		expect(result.current.dirty).toBe(true);
		expect(result.current.changedCount).toBe(1);
	});

	it('sees a change inside an array', () => {
		const { result } = renderHook(() => useConfigDraft(initial));

		act(() => {
			result.current.set('roleIds', ['r1', 'r2']);
		});

		expect(result.current.changedCount).toBe(1);
	});

	it('goes clean again when a value is edited back to what it was', () => {
		const { result } = renderHook(() => useConfigDraft(initial));

		act(() => {
			result.current.set('channelId', 'c2');
		});
		expect(result.current.dirty).toBe(true);

		act(() => {
			result.current.set('channelId', 'c1');
		});
		expect(result.current.dirty).toBe(false);
	});

	it('counts a deep value restored to its original as unchanged', () => {
		const { result } = renderHook(() => useConfigDraft(initial));

		act(() => {
			result.current.set('message', { mode: 'text', text: 'hello' });
		});
		act(() => {
			result.current.set('message', { mode: 'text', text: 'hi' });
		});

		expect(result.current.dirty).toBe(false);
	});

	it('counts each changed key separately', () => {
		const { result } = renderHook(() => useConfigDraft(initial));

		act(() => {
			result.current.patch({ enabled: false, channelId: 'c2', roleIds: [] });
		});

		expect(result.current.changedCount).toBe(3);
	});

	it('discard puts every field back and clears the dirty flag', () => {
		const { result } = renderHook(() => useConfigDraft(initial));

		act(() => {
			result.current.patch({ enabled: false, channelId: 'c9' });
		});
		act(() => {
			result.current.discard();
		});

		expect(result.current.dirty).toBe(false);
		expect(result.current.draft).toEqual(initial);
	});

	it('save clears dirty and makes the new values the baseline', async () => {
		const { result } = renderHook(() => useConfigDraft(initial));

		act(() => {
			result.current.set('channelId', 'c2');
		});
		await act(async () => {
			await result.current.save();
		});

		expect(result.current.state).toBe('idle');
		expect(result.current.dirty).toBe(false);
		expect(result.current.saved.channelId).toBe('c2');
	});

	it('reports saving for exactly as long as the write takes', async () => {
		let release: (outcome: SaveOutcome<Config>) => void = () => undefined;

		const save = (): Promise<SaveOutcome<Config>> =>
			new Promise<SaveOutcome<Config>>((resolve) => {
				release = resolve;
			});

		const { result } = renderHook(() => useConfigDraft(initial, { save }));

		act(() => {
			result.current.set('channelId', 'c2');
		});

		let pending: Promise<SaveState>;
		act(() => {
			pending = result.current.save();
		});

		await waitFor(() => {
			expect(result.current.state).toBe('saving');
		});

		await act(async () => {
			release({ status: 'saved', saved: { ...initial, channelId: 'c2' } });
			await pending;
		});

		expect(result.current.state).toBe('idle');
	});

	it('lands in the conflict state when the write is refused', async () => {
		const { result } = renderHook(() => useConfigDraft(initial));

		act(() => {
			result.current.armConflict();
			result.current.set('channelId', 'c2');
		});
		await act(async () => {
			await result.current.save();
		});

		expect(result.current.state).toBe('conflict');
		expect(result.current.dirty).toBe(true);
	});

	it('resolving a conflict with "reload" throws away my edits', async () => {
		const { result } = renderHook(() => useConfigDraft(initial));

		act(() => {
			result.current.armConflict();
			result.current.set('channelId', 'c2');
		});
		await act(async () => {
			await result.current.save();
		});
		act(() => {
			result.current.resolveConflict('reload');
		});

		expect(result.current.state).toBe('idle');
		expect(result.current.draft.channelId).toBe('c1');
		expect(result.current.dirty).toBe(false);
	});

	it('resolving a conflict with "keep-mine" keeps my edits', async () => {
		const { result } = renderHook(() => useConfigDraft(initial));

		act(() => {
			result.current.armConflict();
			result.current.set('channelId', 'c2');
		});
		await act(async () => {
			await result.current.save();
		});
		act(() => {
			result.current.resolveConflict('keep-mine');
		});

		expect(result.current.state).toBe('idle');
		expect(result.current.draft.channelId).toBe('c2');
		expect(result.current.dirty).toBe(false);
	});
});
