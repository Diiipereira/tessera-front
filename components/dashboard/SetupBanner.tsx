'use client';

import { Check, X, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { BRAND } from '@/lib/brand';
import { guildHref } from '@/lib/navigation';
import type { SetupChecklistItem } from '@/lib/types/overview';
import { cn } from '@/lib/utils/cn';

type SetupBannerProps = {
	items: SetupChecklistItem[];
	guildId: string;
	onDismiss: () => void;
};

export function SetupBanner({ items, guildId, onDismiss }: SetupBannerProps) {
	const t = useTranslations('overview.setup');
	const remaining = items.filter((item) => !item.done).length;

	return (
		<div className="flex gap-4 rounded-lg border border-primary bg-primary-subtle p-5">
			<Zap className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />

			<div className="min-w-0 flex-1">
				<h2 className="text-h4 text-primary-subtle-fg">
					{t('title', { brand: BRAND.name, count: remaining })}
				</h2>
				<p className="mb-3 text-body-sm text-pretty text-primary-subtle-fg opacity-90">
					{t('body')}
				</p>

				<ul className="flex flex-col gap-2">
					{items.map((item) => (
						<li key={item.id} className="flex items-center gap-2.5">
							<span
								aria-hidden="true"
								className={cn(
									'grid size-4 shrink-0 place-items-center rounded-full border',
									item.done ? 'border-success bg-success' : 'border-primary'
								)}
							>
								{item.done ? <Check className="size-3 stroke-3 text-on-dark" /> : null}
							</span>
							<span
								className={cn(
									'min-w-0 flex-1 text-body',
									item.done ? 'text-text-muted line-through' : 'text-primary-subtle-fg'
								)}
							>
								{t(`${item.id}.label`)}
							</span>
							{item.done ? null : (
								<Button variant="outline" size="sm" href={guildHref(guildId, item.path)}>
									{t(`${item.id}.action`)}
								</Button>
							)}
						</li>
					))}
				</ul>
			</div>

			<button
				type="button"
				aria-label={t('dismiss')}
				className="grid size-8 shrink-0 place-items-center rounded-md text-primary-subtle-fg transition-colors duration-120 ease-out hover:bg-primary/15"
				onClick={onDismiss}
			>
				<X className="size-4" aria-hidden="true" />
			</button>
		</div>
	);
}
