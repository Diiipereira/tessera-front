'use client';

import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Switch } from '@/components/ui/Switch';
import { docsHref } from '@/lib/docs/types';
import type { ModuleId } from '@/lib/types/modules';
import { cn } from '@/lib/utils/cn';

type ModulePageProps = {
	moduleId: ModuleId;
	icon: LucideIcon;
	title: string;
	description: string;
	enabled: boolean;
	onEnabledChange: (enabled: boolean) => void;
	headerAction?: ReactNode;
	aside?: ReactNode;
	saveBar?: ReactNode;
	children: ReactNode;
};

export function ModulePage({
	moduleId,
	icon: Icon,
	title,
	description,
	enabled,
	onEnabledChange,
	headerAction,
	aside,
	saveBar,
	children
}: ModulePageProps) {
	const t = useTranslations('modules');

	return (
		<div className="w-full p-6 sm:p-8">
			<header className="flex flex-wrap items-start gap-4">
				<span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-subtle">
					<Icon className="size-5 text-primary" aria-hidden="true" />
				</span>

				<div className="min-w-60 flex-1">
					<h1 className="text-h1">{title}</h1>
					<p className="text-body text-pretty text-text-muted">{description}</p>
				</div>

				<div className="flex shrink-0 items-center gap-4">
					{headerAction}
					<Link
						href={docsHref(`modules/${moduleId}`)}
						className="relative flex items-center gap-1 text-body-sm text-link no-underline before:absolute before:inset-x-0 before:-inset-y-0.5 before:content-[''] hover:text-link-hover"
					>
						{t('docs')}
						<ArrowUpRight className="size-3.5" aria-hidden="true" />
					</Link>
					<Switch
						checked={enabled}
						onCheckedChange={onEnabledChange}
						label={enabled ? t('enabled') : t('disabled')}
					/>
				</div>
			</header>

			<div
				className={cn(
					'mt-6 gap-6',
					aside ? 'grid xl:grid-cols-[minmax(0,1fr)_440px]' : 'flex flex-col'
				)}
			>
				<div
					className={cn(
						'flex min-w-0 flex-col gap-6',
						!enabled && 'pointer-events-none opacity-50'
					)}
					aria-disabled={!enabled || undefined}
				>
					{children}
				</div>

				{aside ? <aside className="min-w-0 xl:sticky xl:top-6 xl:self-start">{aside}</aside> : null}
			</div>

			{saveBar}
		</div>
	);
}
