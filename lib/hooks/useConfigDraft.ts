'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

export type SaveState = 'idle' | 'saving' | 'conflict';

export type ConflictChoice = 'reload' | 'keep-mine';

export type SaveOutcome<T> =
	| { status: 'saved'; saved: T }
	| { status: 'conflict'; current: T }
	| { status: 'error'; message: string };

export type ConfigDraftOptions<T> = {
	save?: (draft: T) => Promise<SaveOutcome<T>>;
};

export class ConfigSaveError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ConfigSaveError';
	}
}

export type ConfigDraft<T> = {
	draft: T;
	saved: T;
	dirty: boolean;
	changedCount: number;
	changedKeys: (keyof T)[];
	state: SaveState;
	set: <K extends keyof T>(key: K, value: T[K]) => void;
	patch: (values: Partial<T>) => void;
	discard: () => void;
	save: () => Promise<SaveState>;
	resolveConflict: (choice: ConflictChoice) => void;
	armConflict: () => void;
};

export function deepEqual(a: unknown, b: unknown): boolean {
	if (a === b) return true;
	if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;

	if (Array.isArray(a) || Array.isArray(b)) {
		if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
		return a.every((entry, index) => deepEqual(entry, b[index]));
	}

	const left = a as Record<string, unknown>;
	const right = b as Record<string, unknown>;
	const keys = Object.keys(left);
	if (keys.length !== Object.keys(right).length) return false;
	return keys.every((key) => Object.hasOwn(right, key) && deepEqual(left[key], right[key]));
}

export function useConfigDraft<T extends object>(
	initial: T,
	options: ConfigDraftOptions<T> = {}
): ConfigDraft<T> {
	const [saved, setSaved] = useState<T>(initial);
	const [draft, setDraft] = useState<T>(initial);
	const [state, setState] = useState<SaveState>('idle');

	const conflictArmed = useRef(false);
	const theirs = useRef<T | null>(null);
	const write = options.save;

	const changedKeys = useMemo(
		() => (Object.keys(draft) as (keyof T)[]).filter((key) => !deepEqual(draft[key], saved[key])),
		[draft, saved]
	);

	const set = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
		setDraft((current) => ({ ...current, [key]: value }));
	}, []);

	const patch = useCallback((values: Partial<T>) => {
		setDraft((current) => ({ ...current, ...values }));
	}, []);

	const discard = useCallback(() => {
		setDraft(saved);
		setState('idle');
	}, [saved]);

	const save = useCallback(async (): Promise<SaveState> => {
		setState('saving');

		if (write === undefined) {
			if (conflictArmed.current) {
				conflictArmed.current = false;
				setState('conflict');
				return 'conflict';
			}

			setSaved(draft);
			setState('idle');
			return 'idle';
		}

		const outcome = await write(draft);

		if (outcome.status === 'conflict') {
			theirs.current = outcome.current;
			setState('conflict');
			return 'conflict';
		}

		if (outcome.status === 'error') {
			setState('idle');
			throw new ConfigSaveError(outcome.message);
		}

		setSaved(outcome.saved);
		setDraft(outcome.saved);
		setState('idle');
		return 'idle';
	}, [draft, write]);

	const resolveConflict = useCallback(
		(choice: ConflictChoice) => {
			const current = theirs.current;

			if (choice === 'reload') {
				setSaved(current ?? saved);
				setDraft(current ?? saved);
			} else if (current !== null) {
				setSaved(current);
			} else {
				setSaved(draft);
			}

			theirs.current = null;
			setState('idle');
		},
		[draft, saved]
	);

	const armConflict = useCallback(() => {
		conflictArmed.current = true;
	}, []);

	return {
		draft,
		saved,
		dirty: changedKeys.length > 0,
		changedCount: changedKeys.length,
		changedKeys,
		state,
		set,
		patch,
		discard,
		save,
		resolveConflict,
		armConflict
	};
}
