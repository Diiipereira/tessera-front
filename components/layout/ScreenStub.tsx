'use client';

import { Blocks } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams, usePathname } from 'next/navigation';
import { EmptyState } from '@/components/ui/EmptyState';
import { findNavItem } from '@/lib/navigation';

export function ScreenStub({ title }: { title?: string }) {
	const t = useTranslations('stub');
	const nav = useTranslations('nav');
	const params = useParams<{ guildId?: string }>();
	const pathname = usePathname();
	const item = findNavItem(params.guildId ?? '', pathname);
	const heading = title ?? (item === undefined ? t('fallback') : nav(item.id));

	return (
		<div className="flex w-full flex-col gap-6 p-6 sm:p-8">
			<div>
				<h1 className="text-h1">{heading}</h1>
				<p className="text-body text-text-muted">{t('notBuilt')}</p>
			</div>

			<EmptyState icon={Blocks} title={t('lands', { name: heading })} description={t('shell')} />
		</div>
	);
}
