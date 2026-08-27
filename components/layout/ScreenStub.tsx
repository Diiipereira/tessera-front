'use client';

import { Blocks } from 'lucide-react';
import { useParams, usePathname } from 'next/navigation';
import { EmptyState } from '@/components/ui/EmptyState';
import { findNavItem } from '@/lib/navigation';

export function ScreenStub({ title }: { title?: string }) {
	const params = useParams<{ guildId?: string }>();
	const pathname = usePathname();
	const item = findNavItem(params.guildId ?? '', pathname);
	const heading = title ?? item?.label ?? 'Screen';

	return (
		<div className="flex w-full flex-col gap-6 p-6 sm:p-8">
			<div>
				<h1 className="text-h1">{heading}</h1>
				<p className="text-body text-text-muted">This screen has not been built yet.</p>
			</div>

			<EmptyState
				icon={Blocks}
				title={`${heading} lands here`}
				description="The app shell is in place. This route is a placeholder until the screen itself is built."
			/>
		</div>
	);
}
