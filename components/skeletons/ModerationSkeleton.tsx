import {
	FieldSkeleton,
	ModulePageSkeleton,
	SectionSkeleton,
	SwitchSkeleton
} from '@/components/modules/ModuleSkeleton';
import { Skeleton, TextSkeleton } from '@/components/ui/Skeleton';

const ESCALATION_ROWS = [0, 1];

export function ModerationSkeleton() {
	return (
		<ModulePageSkeleton label="Moderation">
			<SectionSkeleton>
				<FieldSkeleton hint control="h-9.5" />
				<FieldSkeleton hint control="h-9.5" />
			</SectionSkeleton>

			<SectionSkeleton>
				<div className="rounded-lg border border-border p-4">
					<TextSkeleton line="body-sm" width="w-48" />
					<TextSkeleton line="body-sm" width="w-full max-w-120" className="mt-1" />
					<Skeleton className="mt-3 h-9 w-40 rounded-md" />
				</div>
			</SectionSkeleton>

			<SectionSkeleton>
				<FieldSkeleton width="w-44" />
				<FieldSkeleton width="w-44" />
				<FieldSkeleton hint width="w-44" />
				<SwitchSkeleton />
			</SectionSkeleton>

			<SectionSkeleton>
				<SwitchSkeleton />
				<div className="flex flex-col">
					<TextSkeleton line="body-sm" width="w-32" className="mb-0.5" />
					<TextSkeleton line="caption" width="w-80 max-w-full" className="mb-1.5" />
					<Skeleton className="h-24 w-full rounded-md" />
					<TextSkeleton line="caption" width="w-16" className="mt-1.5 justify-end" />
				</div>
				<div className="flex flex-col">
					<TextSkeleton line="body-sm" width="w-28" className="mb-1.5" />
					<Skeleton className="h-9 w-full rounded-md" />
					<TextSkeleton line="caption" width="w-72 max-w-full" className="mt-1.5" />
				</div>
			</SectionSkeleton>

			<SectionSkeleton>
				<div className="flex flex-col gap-3">
					<div className="overflow-x-auto">
						<div className="flex min-w-160 flex-col">
							<div className="flex items-center gap-4 border-b border-border pb-2">
								<TextSkeleton line="overline" width="w-24" className="flex-1" />
								<TextSkeleton line="overline" width="w-24" />
								<TextSkeleton line="overline" width="w-20" />
								<TextSkeleton line="overline" width="w-8" />
							</div>
							{ESCALATION_ROWS.map((row) => (
								<div
									key={row}
									className="flex items-center gap-4 border-b border-border py-5 last:border-0"
								>
									<Skeleton className="h-9.5 min-w-0 flex-1 rounded-md" />
									<Skeleton className="h-9 w-40 rounded-md" />
									<Skeleton className="h-9 w-28 rounded-md" />
									<Skeleton className="size-8 rounded-md" />
								</div>
							))}
						</div>
					</div>
					<Skeleton className="h-8 w-32 rounded-md" />
				</div>
			</SectionSkeleton>
		</ModulePageSkeleton>
	);
}
