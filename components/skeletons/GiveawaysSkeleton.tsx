import {
	FieldSkeleton,
	ModulePageSkeleton,
	SectionSkeleton,
	SwitchSkeleton
} from '@/components/modules/ModuleSkeleton';
import { Skeleton, TextSkeleton } from '@/components/ui/Skeleton';

const ACTIVE = [0, 1];

export function GiveawaysSkeleton() {
	return (
		<ModulePageSkeleton label="Giveaways" headerAction headerActionSize="h-8 w-36">
			<SectionSkeleton description={false} action actionSize="h-8.5 w-72">
				<div className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-4">
					{ACTIVE.map((card) => (
						<div
							key={card}
							className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 shadow-1"
						>
							<div className="flex items-start gap-3">
								<div className="min-w-0 flex-1">
									<TextSkeleton line="h4" width="w-40" />
									<TextSkeleton line="caption" width="w-16" />
								</div>
								<Skeleton className="h-5 w-20 shrink-0 rounded-sm" />
							</div>

							<div className="flex items-center gap-2">
								<Skeleton className="size-6 shrink-0 rounded-full" />
								<TextSkeleton line="body-sm" width="w-28" />
								<div className="flex-1" />
								<TextSkeleton line="body-sm" width="w-20" className="shrink-0 justify-end" />
							</div>

							<div className="flex flex-wrap gap-1.5">
								<Skeleton className="h-5 w-24 shrink-0 rounded-sm" />
								<Skeleton className="h-5 w-20 shrink-0 rounded-sm" />
							</div>

							<div className="mt-auto flex items-center gap-2 pt-1">
								<Skeleton className="h-8 w-24 shrink-0 rounded-md" />
							</div>
						</div>
					))}
				</div>
			</SectionSkeleton>

			<SectionSkeleton>
				<FieldSkeleton width="w-32" />
				<SwitchSkeleton />
			</SectionSkeleton>
		</ModulePageSkeleton>
	);
}
