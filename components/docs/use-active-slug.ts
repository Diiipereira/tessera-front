'use client';

import { usePathname } from 'next/navigation';

export function useActiveSlug(): string {
	const pathname = usePathname();
	if (pathname === '/docs' || pathname === '/docs/') return '';

	return pathname.replace(/^\/docs\//, '').replace(/\/$/, '');
}
