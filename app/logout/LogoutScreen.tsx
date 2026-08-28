'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { apiBaseUrl } from '@/lib/api-url';

const SIGNED_OUT_TOAST = 'signed-out';

export function LogoutScreen() {
	const t = useTranslations('auth');
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
				toast.success(t('signedOut'), {
					id: SIGNED_OUT_TOAST,
					description: t('signedOutHint')
				});
			} catch {
				toast.error(t('signedOutLocal'), {
					id: SIGNED_OUT_TOAST,
					description: t('signedOutLocalHint')
				});
			}

			router.push('/');
		}

		void signOut();
	}, [router, t]);

	return (
		<div className="grid min-h-svh place-items-center bg-bg px-6">
			<p className="text-body-sm text-text-muted">{t('signingOutBody')}</p>
		</div>
	);
}
