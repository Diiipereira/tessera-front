'use client';

import { useSession } from '@/components/providers/session-context';
import type { LoginErrorKind } from '@/lib/auth';
import { SignInCard } from './SignInCard';

export function SignInCardConnected({ error }: { error: LoginErrorKind | null }) {
	const { user } = useSession();

	return <SignInCard error={error} user={user} />;
}
