'use client';

import { createContext, useContext } from 'react';

export type NavigationContextValue = {
	pendingHref: string | null;
	start: (href: string) => void;
};

export const NavigationContext = createContext<NavigationContextValue | null>(null);

export function useNavigation(): NavigationContextValue {
	const context = useContext(NavigationContext);
	if (!context) throw new Error('useNavigation must be used inside NavigationProvider');
	return context;
}
