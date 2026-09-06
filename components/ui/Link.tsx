'use client';

import NextLink, { type LinkProps as NextLinkProps } from 'next/link';
import type { MouseEvent } from 'react';
import { useNavigationBlockerStore } from '@/components/providers/navigation-blocker-context';

export type LinkProps<RouteType> = NextLinkProps<RouteType>;

const opensElsewhere = (event: MouseEvent<HTMLAnchorElement>): boolean =>
	event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;

export function Link<RouteType>({ onClick, ...props }: LinkProps<RouteType>) {
	const store = useNavigationBlockerStore();

	return (
		<NextLink<RouteType>
			{...props}
			onClick={(event) => {
				if (store.isBlocked() && !opensElsewhere(event)) {
					event.preventDefault();
					store.refuse();
					return;
				}

				onClick?.(event);
			}}
		/>
	);
}
