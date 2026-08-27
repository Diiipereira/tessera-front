'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { apiBaseUrl } from '@/lib/api-url';

const SIGNED_OUT_TOAST = 'signed-out';

export function LogoutScreen() {
	const router = useRouter();
	const started = useRef(false);

	useEffect(() => {
		if (started.current) return;
		started.current = true;

		async function signOut() {
			try {
				await fetch(`${apiBaseUrl()}/auth/logout`, {
					method: 'POST',
					credentials: 'include'
				});
				toast.success('Signed out', {
					id: SIGNED_OUT_TOAST,
					description: 'You can sign back in with Discord any time.'
				});
			} catch {
				toast.error('Signed out locally', {
					id: SIGNED_OUT_TOAST,
					description: 'The API did not answer, so the session may still be open on the server.'
				});
			}

			router.push('/');
		}

		void signOut();
	}, [router]);

	return (
		<div className="grid min-h-svh place-items-center bg-bg px-6">
			<p className="text-body-sm text-text-muted">Signing you out…</p>
		</div>
	);
}
