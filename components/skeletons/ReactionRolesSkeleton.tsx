import {
	FieldSkeleton,
	ModulePageSkeleton,
	SectionSkeleton,
	SwitchSkeleton
} from '@/components/modules/ModuleSkeleton';
import { Skeleton, TextSkeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/cn';

const PANELS = ['w-36', 'w-32'];
const MODES = [0, 1, 2, 3];
const OPTIONS = [0, 1];

export function ReactionRolesSkeleton() {
	return (
		<ModulePageSkeleton
			label="Reaction roles"
			aside={
				<div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-1">
					<TextSkeleton line="h4" width="w-24" />

					<div className="rounded-lg bg-surface-sunken p-4">
						<TextSkeleton line="body" width="w-40" className="mb-3" />
						<div className="flex flex-wrap gap-2">
							<Skeleton className="h-8 w-24 shrink-0 rounded-sm" />
							<Skeleton className="h-8 w-28 shrink-0 rounded-sm" />
						</div>
					</div>

					<TextSkeleton line="caption" width="w-64 max-w-full" />
				</div>
			}
		>
			<SectionSkeleton description={false} action>
				<div className="flex flex-wrap gap-2">
					{PANELS.map((width) => (
						<Skeleton key={width} className={cn('h-8 shrink-0 rounded-md', width)} />
					))}
				</div>
			</SectionSkeleton>

			<SectionSkeleton description={false} action actionSize="size-8">
				<FieldSkeleton hint />
				<FieldSkeleton />

				<div className="flex flex-col gap-2">
					<TextSkeleton line="body-sm" width="w-12" />
					<div className="grid gap-2 sm:grid-cols-2">
						{MODES.map((mode) => (
							<div
								key={mode}
								className="flex flex-col gap-0.5 rounded-lg border border-border bg-surface p-3"
							>
								<TextSkeleton line="body-sm" width="w-16" />
								<TextSkeleton line="caption" width="w-full" />
							</div>
						))}
					</div>
				</div>

				<SwitchSkeleton />
			</SectionSkeleton>

			<SectionSkeleton action>
				{OPTIONS.map((option) => (
					<div
						key={option}
						className="flex items-start gap-2 rounded-md border border-border bg-surface-sunken p-3"
					>
						<Skeleton className="mt-2.5 size-4 shrink-0 rounded-sm" />

						<div className="flex min-w-0 flex-1 flex-col gap-2">
							<div className="flex flex-wrap items-end gap-2">
								<div className="flex w-20 flex-col">
									<TextSkeleton line="body-sm" width="w-full" className="mb-1.5" />
									<Skeleton className="h-9 w-full rounded-md" />
								</div>
								<div className="flex min-w-40 flex-1 flex-col">
									<TextSkeleton line="body-sm" width="w-12" className="mb-1.5" />
									<Skeleton className="h-9 w-full rounded-md" />
								</div>
							</div>

							<FieldSkeleton control="h-9.5" />
						</div>

						<Skeleton className="size-8 shrink-0 rounded-md" />
					</div>
				))}
			</SectionSkeleton>
		</ModulePageSkeleton>
	);
}
