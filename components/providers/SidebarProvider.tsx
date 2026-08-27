'use client';

import { useCallback, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
import { STORAGE_PREFIX } from '@/lib/brand';
import { SidebarContext } from './sidebar-context';

const STORAGE_KEY = `${STORAGE_PREFIX}sidebar`;
const ATTRIBUTE = 'data-sidebar';
const COLLAPSED = 'collapsed';
const EXPANDED = 'expanded';
const CHANGED = `${STORAGE_PREFIX}sidebar-changed`;

function subscribe(onChange: () => void): () => void {
	window.addEventListener(CHANGED, onChange);
	return () => {
		window.removeEventListener(CHANGED, onChange);
	};
}

function getSnapshot(): boolean {
	return document.documentElement.getAttribute(ATTRIBUTE) === COLLAPSED;
}

function getServerSnapshot(): boolean {
	return false;
}

function persist(value: string): void {
	try {
		localStorage.setItem(STORAGE_KEY, value);
	} catch {
		return;
	}
}

export function SidebarProvider({ children }: { children: ReactNode }) {
	const collapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
	const [mobileOpen, setMobileOpen] = useState(false);

	const toggle = useCallback(() => {
		const next = getSnapshot() ? EXPANDED : COLLAPSED;
		document.documentElement.setAttribute(ATTRIBUTE, next);
		persist(next);
		window.dispatchEvent(new Event(CHANGED));
	}, []);

	const value = useMemo(
		() => ({ collapsed, mobileOpen, toggle, setMobileOpen }),
		[collapsed, mobileOpen, toggle]
	);

	return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}
