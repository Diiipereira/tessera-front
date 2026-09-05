'use client';

import { usePathname } from 'next/navigation';
import { readDocsPath } from '@/lib/docs/route';

export function useActiveSlug(): string {
	const route = readDocsPath(usePathname());

	return route.kind === 'outside' ? '' : route.slug;
}
