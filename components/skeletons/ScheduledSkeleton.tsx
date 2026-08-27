import {
	ComposerSkeleton,
	FieldSkeleton,
	ModulePageSkeleton,
	SectionSkeleton
} from '@/components/modules/ModuleSkeleton';
import { Skeleton, TextSkeleton } from '@/components/ui/Skeleton';

const MESSAGES = ['w-48', 'w-36', 'w-44'];
const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];
const NEXT_RUNS = [0, 1, 2];

export function ScheduledSkeleton() {
	return (
		<ModulePageSkeleton label="Scheduled messages">
			<SectionSkeleton action actionSize="h-8 w-36">
				<div className="max-w-80">
					<FieldSkeleton />
				</div>

				<div className="flex flex-col">
					{MESSAGES.map((width) => (
						<div
							key={width}
							className="flex items-center gap-3 border-b border-border py-3 last:border-0"
						>
							<div className="min-w-0 flex-1">
								<TextSkeleton line="body" width={width} />
								<TextSkeleton line="caption" width="w-56 max-w-full" />
							</div>
							<Skeleton className="mt-0.5 h-5 w-9 shrink-0 rounded-full" />
							<Skeleton className="size-8 shrink-0 rounded-md" />
							<Skeleton className="size-8 shrink-0 rounded-md" />
						</div>
					))}
				</div>
			</SectionSkeleton>

			<SectionSkeleton description={false}>
				<FieldSkeleton hint />
				<FieldSkeleton />

				<div className="flex flex-col gap-2">
					<TextSkeleton line="body-sm" width="w-20" />
					<Skeleton className="h-9.5 w-48 rounded-md" />
				</div>

				<div className="flex flex-col gap-2">
					<TextSkeleton line="body-sm" width="w-12" />
					<div className="flex flex-wrap gap-1.5">
						{WEEKDAYS.map((day) => (
							<Skeleton key={day} className="size-9 shrink-0 rounded-md" />
						))}
					</div>
				</div>

				<div className="max-w-40">
					<FieldSkeleton />
				</div>

				<div className="rounded-md border border-border bg-surface-sunken p-3">
					<TextSkeleton line="overline" width="w-10" className="mb-1" />
					<TextSkeleton line="body-sm" width="w-40" className="h-5.5" />
				</div>

				<div>
					<TextSkeleton line="overline" width="w-14" className="mb-1.5" />
					<div className="flex flex-col gap-1">
						{NEXT_RUNS.map((run) => (
							<TextSkeleton key={run} line="body-sm" width="w-56 max-w-full" />
						))}
					</div>
				</div>
			</SectionSkeleton>

			<SectionSkeleton description={false}>
				<ComposerSkeleton />
			</SectionSkeleton>
		</ModulePageSkeleton>
	);
}
