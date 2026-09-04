'use client';

import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { moduleIcons } from '@/lib/module-icons';
import { guildHref } from '@/lib/navigation';
import type { ModuleStatus, ModuleSummary } from '@/lib/types/modules';

const statusVariants: Record<ModuleStatus, BadgeVariant> = {
	active: 'success',
	off: 'neutral',
	'needs-setup': 'warning'
};

type ModuleCardProps = {
	module: ModuleSummary;
	guildId: string;
	busy?: boolean;
	onToggle: (id: ModuleSummary['id'], enabled: boolean) => void;
};

export function ModuleCard({ module, guildId, busy = false, onToggle }: ModuleCardProps) {
	const t = useTranslations('catalog');
	const names = useTranslations('nav');
	const Icon = moduleIcons[module.id];
	const href = guildHref(guildId, `/modules/${module.id}`);
	const name = names(module.id);
	const unconfigured = module.status === 'needs-setup';

	return (
		<div className="group relative flex flex-col rounded-lg border border-border bg-surface shadow-1 transition-[border-color,box-shadow] duration-120 ease-out hover:border-border-strong hover:shadow-2">
			<div className="flex flex-col gap-3 p-5">
				<div className="flex items-start gap-3">
					<span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-subtle">
						<Icon className="size-5 text-primary" aria-hidden="true" />
					</span>

					<div className="min-w-0 flex-1">
						<h2 className="min-w-0 truncate text-h4">{name}</h2>
						<p className="mt-0.5 text-body-sm text-pretty text-text-muted">
							{t(`blurb.${module.id}`)}
						</p>
					</div>

					<Switch
						checked={module.status === 'active'}
						aria-label={t('enable', { name })}
						disabled={busy || unconfigured}
						onCheckedChange={(next) => {
							onToggle(module.id, next);
						}}
						className="shrink-0"
					/>
				</div>
			</div>

			<div className="mt-auto flex items-center gap-3 border-t border-border px-5 py-3">
				<Badge variant={statusVariants[module.status]} dot>
					{t(`status.${module.status}`)}
				</Badge>
				<div className="flex-1" />
				<Link
					href={href}
					className="flex items-center gap-1 text-body-sm text-link no-underline hover:text-link-hover"
				>
					{t('configure')}
					<ArrowRight className="size-3.5" aria-hidden="true" />
				</Link>
			</div>
		</div>
	);
}
