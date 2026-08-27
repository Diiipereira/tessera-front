'use client';

import { createContext, useContext } from 'react';

export type SidebarContextValue = {
	collapsed: boolean;
	mobileOpen: boolean;
	toggle: () => void;
	setMobileOpen: (open: boolean) => void;
};

export const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar(): SidebarContextValue {
	const context = useContext(SidebarContext);
	if (!context) throw new Error('useSidebar must be used inside SidebarProvider');
	return context;
}
