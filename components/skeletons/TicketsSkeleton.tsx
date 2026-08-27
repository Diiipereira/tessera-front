import {
	ComposerSkeleton,
	FieldSkeleton,
	ModulePageSkeleton,
	SectionSkeleton,
	SwitchSkeleton
} from '@/components/modules/ModuleSkeleton';
import { Skeleton, TextSkeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/cn';

const PANELS = ['w-36', 'w-32'];

export function TicketsSkeleton() {
	return (
		<ModulePageSkeleton
			label="Tickets"
			headerAction
			headerActionSize="h-8.5 w-60"
			aside={
				<div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-1">
					<TextSkeleton line="h4" width="w-24" />

					<div className="rounded-lg bg-surface-sunken p-4">
						<div className="flex gap-3">
							<Skeleton className="size-10 shrink-0 rounded-full" />
							<div className="min-w-0 flex-1">
								<TextSkeleton line="body-sm" width="w-40" />
								<Skeleton className="mt-2 h-9 w-full rounded-sm" />
							</div>
						</div>
					</div>

					<div className="rounded-md border border-border bg-surface-sunken p-3">
						<TextSkeleton line="caption" width="w-48" className="mb-2" />
						<Skeleton className="h-8 w-32 rounded-sm" />
					</div>

					<TextSkeleton line="caption" width="w-full" />
				</div>
			}
		>
			<SectionSkeleton action>
				<div className="flex flex-wrap gap-2">
					{PANELS.map((width) => (
						<Skeleton key={width} className={cn('h-8 shrink-0 rounded-md', width)} />
					))}
				</div>
			</SectionSkeleton>

			<SectionSkeleton description={false} action actionSize="size-8">
				<FieldSkeleton hint />
				<FieldSkeleton hint />
				<FieldSkeleton hint control="h-9.5" />

				<div className="flex flex-wrap items-end gap-4">
					<div className="flex min-w-56 flex-1 flex-col">
						<TextSkeleton line="body-sm" width="w-32" className="mb-0.5" />
						<TextSkeleton line="caption" width="w-64 max-w-full" className="mb-1.5" />
						<Skeleton className="h-9 w-full rounded-md" />
					</div>
					<div className="flex w-44 flex-col">
						<TextSkeleton line="body-sm" width="w-full" className="mb-1.5" />
						<Skeleton className="h-9 w-full rounded-md" />
					</div>
				</div>

				<FieldSkeleton />
			</SectionSkeleton>

			<SectionSkeleton>
				<ComposerSkeleton />
			</SectionSkeleton>

			<SectionSkeleton>
				<SwitchSkeleton />
				<SwitchSkeleton description={false} />
				<FieldSkeleton hint width="w-56" />
			</SectionSkeleton>
		</ModulePageSkeleton>
	);
}
