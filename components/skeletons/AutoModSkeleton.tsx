import { ModulePageSkeleton, SectionSkeleton } from '@/components/modules/ModuleSkeleton';
import { Skeleton, TextSkeleton } from '@/components/ui/Skeleton';

const RULE_ROWS = [0, 1, 2, 3];

export function AutoModSkeleton() {
	return (
		<ModulePageSkeleton label="AutoMod" headerAction>
			<SectionSkeleton>
				<div className="overflow-x-auto">
					<div className="flex min-w-160 flex-col">
						<div className="flex items-center gap-4 border-b border-border pb-2">
							<TextSkeleton line="overline" width="w-24" className="flex-1" />
							<TextSkeleton line="overline" width="w-20" />
							<TextSkeleton line="overline" width="w-16" />
							<TextSkeleton line="overline" width="w-8" />
							<TextSkeleton line="overline" width="w-16" />
						</div>
						{RULE_ROWS.map((row) => (
							<div
								key={row}
								className="flex items-center gap-4 border-b border-border py-3 last:border-0"
							>
								<div className="flex min-w-0 flex-1 flex-col">
									<TextSkeleton line="body" width="w-52 max-w-full" />
									<TextSkeleton line="caption" width="w-72 max-w-full" />
								</div>
								<TextSkeleton line="body-sm" width="w-20" />
								<Skeleton className="h-5 w-16 shrink-0 rounded-sm" />
								<Skeleton className="h-5 w-9 shrink-0 rounded-full" />
								<Skeleton className="h-7.5 w-16 shrink-0 rounded-md" />
							</div>
						))}
					</div>
				</div>
			</SectionSkeleton>

			<SectionSkeleton>
				<div className="flex flex-col">
					<TextSkeleton line="body-sm" width="w-40" className="mb-1.5" />
					<Skeleton className="h-20 w-full rounded-md" />
				</div>
				<div className="rounded-lg border border-border p-4">
					<TextSkeleton line="body-sm" width="w-72 max-w-full" />
				</div>
				<TextSkeleton line="caption" width="w-96 max-w-full" />
			</SectionSkeleton>
		</ModulePageSkeleton>
	);
}
