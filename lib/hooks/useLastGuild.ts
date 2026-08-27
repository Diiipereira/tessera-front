'use client';

import { useSyncExternalStore } from 'react';
import { STORAGE_PREFIX } from '@/lib/brand';
import { guildHref, type GuildHref } from '@/lib/navigation';

const STORAGE_KEY = `${STORAGE_PREFIX}last-guild`;
const CHANGED = `${STORAGE_PREFIX}last-guild-changed`;

export function rememberGuild(guildId: string): void {
	try {
		if (localStorage.getItem(STORAGE_KEY) === guildId) return;
		localStorage.setItem(STORAGE_KEY, guildId);
		window.dispatchEvent(new Event(CHANGED));
	} catch {
		return;
	}
}

function subscribe(onChange: () => void): () => void {
	window.addEventListener(CHANGED, onChange);
	window.addEventListener('storage', onChange);

	return () => {
		window.removeEventListener(CHANGED, onChange);
		window.removeEventListener('storage', onChange);
	};
}

function getSnapshot(): string | null {
	try {
		return localStorage.getItem(STORAGE_KEY);
	} catch {
		return null;
	}
}

function getServerSnapshot(): string | null {
	return null;
}

export function useDashboardHref(): GuildHref | '/servers' {
	const guildId = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

	return guildId === null || guildId === '' ? '/servers' : guildHref(guildId, '');
}
