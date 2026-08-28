'use client';

import { LoaderCircle, RefreshCw, TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import type { CallbackFailure } from '@/lib/auth';

const HANDOFF_MS = 1200;

export function CallbackScreen({ failure }: { failure: CallbackFailure | null }) {
	const t = useTranslations('auth');
	const router = useRouter();

	useEffect(() => {
		if (failure) return;
		const timer = setTimeout(() => {
			router.push('/servers');
		}, HANDOFF_MS);
		return () => {
			clearTimeout(timer);
		};
	}, [failure, router]);

	return (
		<div className="grid min-h-svh place-items-center bg-bg px-6 py-12">
			<div className="flex w-full max-w-100 flex-col items-center gap-4 text-center">
				{failure ? (
					<>
						<div className="grid size-16 place-items-center rounded-full bg-danger-subtle text-danger">
							<TriangleAlert className="size-8" aria-hidden="true" />
						</div>
						<h1 className="text-h3">{t('failedTitle')}</h1>
						<p className="text-body-sm text-pretty text-text-muted">
							{t.rich('returned', {
								code: failure.code,
								reason: t(`failures.${failure.kind}`),
								mono: (chunks) => <span className="font-mono text-text">{chunks}</span>
							})}
						</p>
						<div className="mt-2 flex flex-wrap justify-center gap-2">
							<Button href="/login">
								<RefreshCw aria-hidden="true" />
								{t('tryAgain')}
							</Button>
							<Button variant="outline" href="/">
								{t('backHome')}
							</Button>
						</div>
						<p className="mt-2 font-mono text-caption font-normal text-text-muted">
							{t('reference', { reference: failure.reference })}
						</p>
					</>
				) : (
					<>
						<LoaderCircle className="size-12 animate-spin text-primary" aria-hidden="true" />
						<h1 className="text-h3">{t('connectingAccount')}</h1>
						<p className="text-body-sm text-text-muted">{t('handoff')}</p>
					</>
				)}
			</div>
		</div>
	);
}
