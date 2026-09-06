'use client';

import { createContext, useContext, useSyncExternalStore } from 'react';

export type NavigationBlockerStore = {
	subscribe: (listener: () => void) => () => void;
	isBlocked: () => boolean;
	refusalCount: () => number;
	hold: (id: string) => void;
	release: (id: string) => void;
	refuse: () => void;
};

export function createNavigationBlockerStore(): NavigationBlockerStore {
	const holders = new Set<string>();
	const listeners = new Set<() => void>();
	let refusals = 0;

	const announce = () => {
		for (const listener of listeners) listener();
	};

	return {
		subscribe: (listener) => {
			listeners.add(listener);

			return () => {
				listeners.delete(listener);
			};
		},
		isBlocked: () => holders.size > 0,
		refusalCount: () => refusals,
		hold: (id) => {
			if (holders.has(id)) return;

			holders.add(id);
			announce();
		},
		release: (id) => {
			if (!holders.delete(id)) return;

			announce();
		},
		refuse: () => {
			refusals += 1;
			announce();
		}
	};
}

const NavigationBlockerContext = createContext<NavigationBlockerStore>(
	createNavigationBlockerStore()
);

export const NavigationBlockerProviderContext = NavigationBlockerContext.Provider;

export function useNavigationBlockerStore(): NavigationBlockerStore {
	return useContext(NavigationBlockerContext);
}

export function useNavigationHold(): Pick<NavigationBlockerStore, 'hold' | 'release'> {
	const { hold, release } = useContext(NavigationBlockerContext);

	return { hold, release };
}

export function useNavigationBlocked(): boolean {
	const store = useContext(NavigationBlockerContext);

	return useSyncExternalStore(store.subscribe, store.isBlocked, store.isBlocked);
}

export function useNavigationRefusals(): number {
	const store = useContext(NavigationBlockerContext);

	return useSyncExternalStore(store.subscribe, store.refusalCount, store.refusalCount);
}
