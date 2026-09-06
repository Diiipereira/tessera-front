'use client';

import { CircleHelp } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Popover } from '@/components/ui/Popover';

const POINTS = ['direct', 'public', 'attachment', 'host'] as const;

export function ImageUrlHelp() {
	const t = useTranslations('modules.imageHelp');

	return (
		<Popover
			align="start"
			triggerClassName="grid size-5 place-items-center rounded-sm text-text-muted transition-colors duration-120 ease-out hover:bg-surface-hover hover:text-text"
			className="w-80 max-w-none p-0"
			trigger={
				<>
					<CircleHelp className="size-3.5" aria-hidden="true" />
					<span className="sr-only">{t('help')}</span>
				</>
			}
		>
			<div className="border-b border-border px-3 py-2">
				<p className="text-body-sm font-medium">{t('title')}</p>
				<p className="text-caption font-normal text-text-muted">{t('body')}</p>
			</div>

			<ul className="flex flex-col p-1">
				{POINTS.map((point) => (
					<li key={point} className="flex flex-col gap-0.5 px-2 py-1.5">
						<span className="text-caption font-medium">{t(`points.${point}.title`)}</span>
						<span className="text-caption font-normal text-pretty text-text-muted">
							{t(`points.${point}.body`)}
						</span>
					</li>
				))}
			</ul>
		</Popover>
	);
}
