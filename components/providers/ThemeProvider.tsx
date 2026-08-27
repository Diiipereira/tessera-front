'use client';

import { useCallback, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { STORAGE_PREFIX } from '@/lib/brand';
import { isDark, ThemeContext, type ResolvedTheme, type ThemeMode } from './theme-context';

const STORAGE_KEY = `${STORAGE_PREFIX}theme`;
const CHANGED = `${STORAGE_PREFIX}theme-changed`;
const DARK_QUERY = '(prefers-color-scheme: dark)';

function subscribeMode(onChange: () => void): () => void {
	const handle = () => {
		applyResolved();
		onChange();
	};
	window.addEventListener(CHANGED, handle);
	window.addEventListener('storage', handle);
	return () => {
		window.removeEventListener(CHANGED, handle);
		window.removeEventListener('storage', handle);
	};
}

function getModeSnapshot(): ThemeMode {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		return stored === 'light' || stored === 'dark' ? stored : 'system';
	} catch {
		return 'system';
	}
}

function getModeServerSnapshot(): ThemeMode {
	return 'system';
}

function subscribeMedia(onChange: () => void): () => void {
	const query = window.matchMedia(DARK_QUERY);
	const handle = () => {
		applyResolved();
		onChange();
	};
	query.addEventListener('change', handle);
	return () => {
		query.removeEventListener('change', handle);
	};
}

function getPrefersDark(): boolean {
	return window.matchMedia(DARK_QUERY).matches;
}

function getPrefersDarkServerSnapshot(): boolean {
	return true;
}

function applyResolved(): void {
	document.documentElement.classList.toggle('dark', isDark(getModeSnapshot(), getPrefersDark()));
}

function persistMode(mode: ThemeMode): void {
	try {
		if (mode === 'system') localStorage.removeItem(STORAGE_KEY);
		else localStorage.setItem(STORAGE_KEY, mode);
	} catch {
		return;
	}
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const mode = useSyncExternalStore(subscribeMode, getModeSnapshot, getModeServerSnapshot);
	const prefersDark = useSyncExternalStore(
		subscribeMedia,
		getPrefersDark,
		getPrefersDarkServerSnapshot
	);

	const resolved: ResolvedTheme = isDark(mode, prefersDark) ? 'dark' : 'light';

	useEffect(() => {
		document.documentElement.classList.toggle('dark', resolved === 'dark');
	}, [resolved]);

	const setMode = useCallback((next: ThemeMode) => {
		persistMode(next);
		window.dispatchEvent(new Event(CHANGED));
	}, []);

	const value = useMemo(() => ({ mode, resolved, setMode }), [mode, resolved, setMode]);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
