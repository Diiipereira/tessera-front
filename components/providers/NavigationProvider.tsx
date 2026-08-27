'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { NavigationContext } from './navigation-context';

export function NavigationProvider({ children }: { children: ReactNode }) {
	const pathname = usePathname();
	const [target, setTarget] = useState<{ href: string; from: string } | null>(null);

	const start = useCallback(
		(href: string) => {
			setTarget(href === pathname ? null : { href, from: pathname });
		},
		[pathname]
	);

	const pendingHref = target !== null && target.from === pathname ? target.href : null;

	const value = useMemo(() => ({ pendingHref, start }), [pendingHref, start]);

	return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}
