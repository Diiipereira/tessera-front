'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { UserMenu } from '@/components/layout/UserMenu';
import { useSession } from '@/components/providers/session-context';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { signInHref } from '@/lib/api-url';

export function PublicHeaderActions() {
	const { status, user } = useSession();
	const pathname = usePathname();
	const [redirecting, setRedirecting] = useState(false);

	function start() {
		setRedirecting(true);
		window.location.assign(signInHref('/servers'));
	}

	const control =
		status === 'loading' ? (
			<Skeleton className="size-8 rounded-full" />
		) : status === 'signed-in' && user !== null ? (
			<UserMenu user={user} compact />
		) : status === 'unconfirmed' || pathname === '/login' ? null : (
			<Button variant="outline" onClick={start} loading={redirecting}>
				Sign in
			</Button>
		);

	return (
		<div className="ml-auto flex shrink-0 items-center gap-3">
			<ThemeToggle />

			{control === null ? null : (
				<div className="flex min-w-20 items-center justify-end">{control}</div>
			)}
		</div>
	);
}
