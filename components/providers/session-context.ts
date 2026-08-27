'use client';

import { createContext, useContext } from 'react';
import type { SessionUser } from '@/lib/types/session';

export type SessionStatus = 'loading' | 'anonymous' | 'signed-in' | 'unconfirmed';

export type SessionState = {
	status: SessionStatus;
	user: SessionUser | null;
};

export const SessionContext = createContext<SessionState>({
	status: 'anonymous',
	user: null
});

export function useSession(): SessionState {
	return useContext(SessionContext);
}
