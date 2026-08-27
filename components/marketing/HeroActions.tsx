'use client';

import { LayoutDashboard, Plus } from 'lucide-react';
import { useSession } from '@/components/providers/session-context';
import { Button } from '@/components/ui/Button';
import { BRAND } from '@/lib/brand';
import { INVITE_HREF } from '@/lib/discord-invite';

export function HeroActions() {
	const { status } = useSession();

	return (
		<div className="mt-8 flex flex-wrap gap-3">
			<Button size="xl" href={INVITE_HREF} rel="external">
				<Plus aria-hidden="true" />
				Add {BRAND.name} to Discord
			</Button>

			{status === 'signed-in' || status === 'unconfirmed' ? (
				<Button size="xl" variant="outline" href="/servers">
					<LayoutDashboard aria-hidden="true" />
					Open dashboard
				</Button>
			) : null}
		</div>
	);
}
