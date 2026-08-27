'use client';

import { LoaderCircle, RefreshCw, TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import type { CallbackFailure } from '@/lib/auth';

const HANDOFF_MS = 1200;

export function CallbackScreen({ failure }: { failure: CallbackFailure | null }) {
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
						<h1 className="text-h3">We couldn&rsquo;t complete sign-in</h1>
						<p className="text-body-sm text-pretty text-text-muted">
							Discord returned <span className="font-mono text-text">{failure.code}</span> &mdash;{' '}
							{failure.reason}
						</p>
						<div className="mt-2 flex flex-wrap justify-center gap-2">
							<Button href="/login">
								<RefreshCw aria-hidden="true" />
								Try again
							</Button>
							<Button variant="outline" href="/">
								Back to home
							</Button>
						</div>
						<p className="mt-2 font-mono text-caption font-normal text-text-muted">
							ref {failure.reference}
						</p>
					</>
				) : (
					<>
						<LoaderCircle className="size-12 animate-spin text-primary" aria-hidden="true" />
						<h1 className="text-h3">Connecting your account…</h1>
						<p className="text-body-sm text-text-muted">This takes a second.</p>
					</>
				)}
			</div>
		</div>
	);
}
