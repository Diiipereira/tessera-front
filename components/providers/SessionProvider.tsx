'use client';

import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from 'react';
import { apiBaseUrl, type AuthenticatedUserDto } from '@/lib/api-url';
import { toSessionUser } from '@/lib/guild-presentation';
import { readSignedInHint } from '@/lib/session-hint';
import type { SessionUser } from '@/lib/types/session';
import { SessionContext, type SessionState, type SessionStatus } from './session-context';

function subscribe(): () => void {
	return () => undefined;
}

function serverSnapshot(): boolean {
	return false;
}

type Resolution =
	| { outcome: 'signed-in'; user: SessionUser }
	| { outcome: 'anonymous' }
	| { outcome: 'unreachable' };

export function SessionProvider({ children }: { children: ReactNode }) {
	const hinted = useSyncExternalStore(subscribe, readSignedInHint, serverSnapshot);
	const [resolved, setResolved] = useState<Resolution | null>(null);

	useEffect(() => {
		if (!hinted) return;

		let cancelled = false;

		async function resolve() {
			try {
				const response = await fetch(`${apiBaseUrl()}/auth/me`, {
					credentials: 'include',
					cache: 'no-store'
				});

				if (cancelled) return;

				if (response.status === 401) {
					setResolved({ outcome: 'anonymous' });
					return;
				}

				if (!response.ok) {
					setResolved({ outcome: 'unreachable' });
					return;
				}

				setResolved({
					outcome: 'signed-in',
					user: toSessionUser((await response.json()) as AuthenticatedUserDto)
				});
			} catch {
				if (!cancelled) setResolved({ outcome: 'unreachable' });
			}
		}

		void resolve();

		return () => {
			cancelled = true;
		};
	}, [hinted]);

	const value = useMemo<SessionState>(() => {
		if (!hinted) return { status: 'anonymous', user: null };
		if (resolved === null) return { status: 'loading', user: null };

		const status: SessionStatus =
			resolved.outcome === 'unreachable' ? 'unconfirmed' : resolved.outcome;

		return { status, user: resolved.outcome === 'signed-in' ? resolved.user : null };
	}, [hinted, resolved]);

	return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
