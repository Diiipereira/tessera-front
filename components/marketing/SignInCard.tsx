'use client';

import { LayoutDashboard, Lock, LogOut, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { DiscordButton } from '@/components/auth/DiscordButton';
import { Avatar } from '@/components/layout/Avatar';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { signInHref } from '@/lib/api-url';
import type { LoginError } from '@/lib/auth';
import type { SessionUser } from '@/lib/types/session';

type SignInCardProps = {
	error: LoginError | null;
	user: SessionUser | null;
};

export function SignInCard({ error, user }: SignInCardProps) {
	const [redirecting, setRedirecting] = useState(false);

	const signedIn = user !== null;

	const primaryLabel = redirecting ? 'Redirecting to Discord…' : 'Continue with Discord';

	function start() {
		setRedirecting(true);
		window.location.assign(signInHref('/servers'));
	}

	return (
		<div>
			<div className="flex flex-col gap-5 rounded-xl border border-border bg-surface p-7 shadow-2">
				<div>
					<h2 className="text-h3">
						{signedIn ? "You're already signed in" : 'Sign in to the dashboard'}
					</h2>
					<p className="mt-1 text-body-sm text-pretty text-text-muted">
						{signedIn
							? 'Continue as yourself, or switch to another Discord account.'
							: 'Discord is the only sign-in — there is no separate password to manage.'}
					</p>
				</div>

				{error ? (
					<Alert variant="danger" title={error.title}>
						{error.body}
					</Alert>
				) : null}

				{user ? (
					<div className="flex items-center gap-3 rounded-lg border border-border bg-surface-sunken p-3">
						<Avatar initials={user.initials} color={user.color} shape="circle" size="lg" />
						<div className="min-w-0 flex-1">
							<p className="truncate text-body font-medium">{user.displayName}</p>
							<p className="truncate font-mono text-caption font-normal text-text-muted">
								{user.handle}
							</p>
						</div>
						<Badge variant="success" dot>
							Signed in
						</Badge>
					</div>
				) : null}

				{user ? (
					<Button size="xl" href="/servers" className="w-full">
						<LayoutDashboard aria-hidden="true" />
						Continue as {user.handle}
					</Button>
				) : (
					<DiscordButton label={primaryLabel} loading={redirecting} onClick={start} />
				)}

				{error ? (
					<Button variant="outline" onClick={start}>
						<RefreshCw aria-hidden="true" />
						Try again
					</Button>
				) : null}

				{signedIn ? (
					<Button variant="ghost" href="/logout">
						<LogOut aria-hidden="true" />
						Use another account
					</Button>
				) : (
					<div className="flex gap-2.5 rounded-lg border border-border bg-surface-sunken p-3">
						<Lock className="mt-0.5 size-4 shrink-0 text-text-muted" aria-hidden="true" />
						<p className="text-caption text-pretty text-text-muted">
							We&rsquo;ll read your username, avatar and the servers you can manage. We never read
							your messages.
						</p>
					</div>
				)}

				<p className="text-caption font-normal text-pretty text-text-muted">
					By continuing you agree to the{' '}
					<Link href="/terms" className="text-link">
						Terms
					</Link>{' '}
					and the{' '}
					<Link href="/privacy" className="text-link">
						Privacy policy
					</Link>
					.
				</p>
			</div>

			<p className="mt-4 text-center text-body-sm text-text-muted">
				You need <span className="font-medium text-text">Manage Server</span> on at least one
				Discord server.
			</p>
		</div>
	);
}
