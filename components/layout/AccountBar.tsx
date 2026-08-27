'use client';

import Link from 'next/link';
import { BrandMark } from '@/components/auth/BrandMark';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { UserMenu } from '@/components/layout/UserMenu';
import { Button } from '@/components/ui/Button';
import { BRAND } from '@/lib/brand';
import type { SessionUser } from '@/lib/types/session';

export function AccountBar({ user }: { user: SessionUser | null }) {
	return (
		<header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-bg px-6 sm:px-8">
			<Link href="/" className="flex items-center gap-2.5">
				<BrandMark size="sm" />
				<span className="text-body font-semibold">{BRAND.name}</span>
			</Link>

			<div className="flex-1" />

			<ThemeToggle />

			{user === null ? (
				<Button variant="ghost" size="sm" href="/logout">
					Sign out
				</Button>
			) : (
				<div className="ml-2 flex items-center border-l border-border pl-4">
					<UserMenu user={user} compact />
				</div>
			)}
		</header>
	);
}
