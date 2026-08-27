import {
	ComposerSkeleton,
	FieldSkeleton,
	ModulePageSkeleton,
	SectionSkeleton,
	SwitchSkeleton
} from '@/components/modules/ModuleSkeleton';
import { Skeleton, TextSkeleton } from '@/components/ui/Skeleton';

export function WelcomeSkeleton() {
	return (
		<ModulePageSkeleton
			label="Welcome"
			headerAction
			aside={
				<div className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-5 shadow-1">
					<div className="flex h-8.5 items-center gap-3">
						<TextSkeleton line="h4" width="w-24" className="min-w-0 flex-1" />
						<Skeleton className="h-8 w-40 shrink-0 rounded-md" />
					</div>
					<div className="rounded-lg bg-surface-sunken p-4">
						<div className="flex gap-3">
							<Skeleton className="size-10 shrink-0 rounded-full" />
							<div className="min-w-0 flex-1">
								<TextSkeleton line="body-sm" width="w-40" />
								<Skeleton className="mt-3 h-60 w-full rounded-sm" />
							</div>
						</div>
					</div>
					<TextSkeleton line="caption" />
					<TextSkeleton line="caption" width="w-2/3" />
				</div>
			}
		>
			<SectionSkeleton>
				<FieldSkeleton hint />
				<ComposerSkeleton embed />
			</SectionSkeleton>

			<SectionSkeleton>
				<SwitchSkeleton />
			</SectionSkeleton>

			<SectionSkeleton>
				<FieldSkeleton />
			</SectionSkeleton>

			<SectionSkeleton>
				<SwitchSkeleton description={false} />
				<FieldSkeleton />
				<ComposerSkeleton />
			</SectionSkeleton>
		</ModulePageSkeleton>
	);
}
