'use client';

import { ArrowRight, Crown } from 'lucide-react';
import Link from 'next/link';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { moduleIcons } from '@/lib/module-icons';
import { guildHref } from '@/lib/navigation';
import type { ModuleStatus, ModuleSummary } from '@/lib/types/modules';
import { cn } from '@/lib/utils/cn';

const statusLabels: Record<ModuleStatus, string> = {
	active: 'Active',
	off: 'Off',
	'needs-setup': 'Needs setup'
};

const statusVariants: Record<ModuleStatus, BadgeVariant> = {
	active: 'success',
	off: 'neutral',
	'needs-setup': 'warning'
};

type ModuleCardProps = {
	module: ModuleSummary;
	guildId: string;
	locked?: boolean;
	onToggle: (id: ModuleSummary['id'], enabled: boolean) => void;
};

export function ModuleCard({ module, guildId, locked = false, onToggle }: ModuleCardProps) {
	const Icon = moduleIcons[module.id];
	const href = guildHref(guildId, `/modules/${module.id}`);

	return (
		<div className="group relative flex flex-col rounded-lg border border-border bg-surface shadow-1 transition-[border-color,box-shadow] duration-120 ease-out hover:border-border-strong hover:shadow-2">
			<div className={cn('flex flex-col gap-3 p-5', locked && 'opacity-50')}>
				<div className="flex items-start gap-3">
					<span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary-subtle">
						<Icon className="size-5 text-primary" aria-hidden="true" />
					</span>

					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-2">
							<h2 className="min-w-0 truncate text-h4">{module.name}</h2>
							{module.premium ? (
								<Badge variant="primary" className="shrink-0">
									<Crown className="size-3" aria-hidden="true" />
									Pro
								</Badge>
							) : null}
						</div>
						<p className="mt-0.5 text-body-sm text-pretty text-text-muted">{module.description}</p>
					</div>

					<Switch
						checked={module.status === 'active'}
						aria-label={`Enable ${module.name}`}
						disabled={locked}
						onCheckedChange={(next) => {
							onToggle(module.id, next);
						}}
						className="shrink-0"
					/>
				</div>
			</div>

			<div className="mt-auto flex items-center gap-3 border-t border-border px-5 py-3">
				<Badge variant={statusVariants[module.status]} dot>
					{statusLabels[module.status]}
				</Badge>
				<div className="flex-1" />
				{locked ? (
					<Link
						href={guildHref(guildId, '/billing')}
						className="flex items-center gap-1 text-body-sm font-medium text-link no-underline hover:text-link-hover"
					>
						Upgrade
						<ArrowRight className="size-3.5" aria-hidden="true" />
					</Link>
				) : (
					<Link
						href={href}
						className="flex items-center gap-1 text-body-sm text-link no-underline hover:text-link-hover"
					>
						Configure
						<ArrowRight className="size-3.5" aria-hidden="true" />
					</Link>
				)}
			</div>
		</div>
	);
}
