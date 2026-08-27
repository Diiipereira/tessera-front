import {
	FieldSkeleton,
	ModulePageSkeleton,
	SectionSkeleton
} from '@/components/modules/ModuleSkeleton';
import { Skeleton, TextSkeleton } from '@/components/ui/Skeleton';

const EVENT_GROUPS = [3, 3, 2, 2, 1];

export function LoggingSkeleton() {
	return (
		<ModulePageSkeleton label="Logging">
			<SectionSkeleton action>
				<div className="flex flex-col gap-6">
					{EVENT_GROUPS.map((rows, group) => (
						<div key={group} className="flex flex-col gap-2">
							<div className="flex h-8 items-center gap-3">
								<TextSkeleton line="caption" width="w-28" />
								<Skeleton className="h-px flex-1" />
							</div>
							<div className="flex flex-col">
								{Array.from({ length: rows }, (_, row) => (
									<div
										key={row}
										className="flex items-center gap-3 border-b border-border py-3 last:border-0"
									>
										<Skeleton className="h-5 w-9 shrink-0 rounded-full" />
										<TextSkeleton line="body-sm" className="min-w-0 flex-1" />
										<Skeleton className="h-9.5 w-64 shrink-0 rounded-md" />
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
