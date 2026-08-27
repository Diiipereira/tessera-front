'use client';

import { useSyncExternalStore } from 'react';

const noop = () => undefined;

function subscribe(): () => void {
	return noop;
}

const APPLE = /\b(Macintosh|Mac OS|iPhone|iPad|iPod)\b/;

function getSnapshot(): boolean {
	return APPLE.test(navigator.userAgent);
}

function getServerSnapshot(): boolean {
	return false;
}

export function useIsApple(): boolean {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function shortcutLabel(key: string, apple: boolean): string {
	return apple ? `⌘${key}` : `Ctrl ${key}`;
}

export function useShortcut(key: string): string {
	return shortcutLabel(key, useIsApple());
}
