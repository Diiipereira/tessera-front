import {
	FieldSkeleton,
	ModulePageSkeleton,
	SectionSkeleton
} from '@/components/modules/ModuleSkeleton';
import { Skeleton, TextSkeleton } from '@/components/ui/Skeleton';

const EVENT_GROUPS = [3, 3, 2, 2, 1];

export function LoggingSkeleton() {
	return (
		<ModulePageSkeleton
			label="Logging"
			aside={
				<div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-1">
					<TextSkeleton line="h4" width="w-24" />

					<FieldSkeleton control="h-9.5" />

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
			<SectionSkeleton action>
				<div className="flex flex-col gap-6">
					{EVENT_GROUPS.map((rows, group) => (
						<div key={group} className="flex flex-col gap-2">
							<div className="flex h-8 items-center gap-3">
								<TextSkeleton line="caption" width="w-28" />
								<Skeleton className="h-px flex-1" />
								<Skeleton className="h-8 w-28 shrink-0 rounded-md" />
							</div>
							<div className="flex flex-col">
								{Array.from({ length: rows }, (_, row) => (
									<div
										key={row}
										className="flex items-center gap-4 border-b border-border py-3 last:border-0"
									>
										<div className="w-2/5 min-w-0">
											<TextSkeleton line="body" width="w-32" />
											<TextSkeleton line="caption" width="w-48 max-w-full" />
										</div>
										<Skeleton className="h-9.5 min-w-0 flex-1 rounded-md" />
										<Skeleton className="h-8 w-24 shrink-0 rounded-md" />
										<Skeleton className="h-5 w-9 shrink-0 rounded-full" />
									</div>
								))}
							</div>
						</div>
					))}
				</div>
			</SectionSkeleton>

			<SectionSkeleton>
				<FieldSkeleton control="h-9.5" />
				<FieldSkeleton control="h-9.5" />
			</SectionSkeleton>
		</ModulePageSkeleton>
	);
}
