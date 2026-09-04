import {
	ComposerSkeleton,
	FieldSkeleton,
	ModulePageSkeleton,
	SectionSkeleton
} from '@/components/modules/ModuleSkeleton';
import { Skeleton, TextSkeleton } from '@/components/ui/Skeleton';

export function WelcomeSkeleton() {
	return (
		<ModulePageSkeleton
			label="Welcome"
			aside={
				<div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-1">
					<TextSkeleton line="h4" width="w-24" />

					<div className="rounded-lg bg-surface-sunken p-4">
						<div className="flex gap-3">
							<Skeleton className="size-10 shrink-0 rounded-full" />
							<div className="min-w-0 flex-1">
								<TextSkeleton line="body" width="w-40" />
								<TextSkeleton line="body" />
								<TextSkeleton line="body" width="w-2/3" />
							</div>
						</div>
					</div>

					<div>
						<TextSkeleton line="caption" />
						<TextSkeleton line="caption" width="w-2/3" />
					</div>
				</div>
			}
		>
			<SectionSkeleton>
				<FieldSkeleton hint />
				<ComposerSkeleton />
			</SectionSkeleton>

			<SectionSkeleton>
				<FieldSkeleton hint />
			</SectionSkeleton>

			<SectionSkeleton>
				<FieldSkeleton />
			</SectionSkeleton>

			<SectionSkeleton>
				<FieldSkeleton />
			</SectionSkeleton>
		</ModulePageSkeleton>
	);
}
