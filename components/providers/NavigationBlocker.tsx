'use client';

import { useState, type ReactNode } from 'react';
import {
	NavigationBlockerProviderContext,
	createNavigationBlockerStore
} from '@/components/providers/navigation-blocker-context';

export function NavigationBlockerProvider({ children }: { children: ReactNode }) {
	const [store] = useState(createNavigationBlockerStore);

	return (
		<NavigationBlockerProviderContext value={store}>{children}</NavigationBlockerProviderContext>
	);
}
