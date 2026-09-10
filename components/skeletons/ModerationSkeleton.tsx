import {
	FieldSkeleton,
	ModulePageSkeleton,
	SectionSkeleton,
	SwitchSkeleton
} from '@/components/modules/ModuleSkeleton';
import { Skeleton, TextSkeleton } from '@/components/ui/Skeleton';

const AUTO_ACTIONS = [0, 1, 2, 3, 4, 5];

const DEFAULTS = [0, 1, 2];

const RUNGS = [0, 1, 2];

export function ModerationSkeleton() {
	return (
		<ModulePageSkeleton label="Moderation">
			<SectionSkeleton>
				<FieldSkeleton hint control="h-9.5" />
			</SectionSkeleton>

			<SectionSkeleton>
				<FieldSkeleton hint control="h-9.5" />
			</SectionSkeleton>

			<SectionSkeleton>
				<FieldSkeleton hint control="h-9.5" />
				<TextSkeleton line="caption" width="w-120 max-w-full" />
			</SectionSkeleton>

			<SectionSkeleton>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{DEFAULTS.map((column) => (
						<FieldSkeleton key={column} hint control="h-9" />
					))}
				</div>
				<SwitchSkeleton />
			</SectionSkeleton>

			<SectionSkeleton>
				<SwitchSkeleton />

				<div className="rounded-lg border border-border p-3">
					<TextSkeleton line="overline" width="w-36" />
					<TextSkeleton line="body-sm" width="w-64" className="mt-1" />
					<TextSkeleton line="body-sm" width="w-48" />
				</div>

				<div className="flex flex-col">
					<TextSkeleton line="body-sm" width="w-44" className="mb-0.5" />
					<TextSkeleton line="caption" width="w-96 max-w-full" className="mb-1.5" />
					<Skeleton className="h-20 w-full rounded-md" />
				</div>

				<FieldSkeleton hint control="h-9.5" />
			</SectionSkeleton>

			<SectionSkeleton>
				<div className="flex flex-col">
					<TextSkeleton line="body-sm" width="w-52" className="mb-0.5" />
					<TextSkeleton line="caption" width="w-88 max-w-full" className="mb-1.5" />
					<div className="flex flex-wrap gap-x-6 gap-y-2">
						{AUTO_ACTIONS.map((action) => (
							<div key={action} className="flex items-center gap-2">
								<Skeleton className="size-4 rounded-sm" />
								<TextSkeleton line="body-sm" width="w-16" />
							</div>
						))}
					</div>
				</div>

				<FieldSkeleton hint control="h-9.5" />
				<FieldSkeleton hint control="h-9.5" />
				<FieldSkeleton hint control="h-9.5" />

				<div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-sunken p-4">
					<div className="flex flex-col gap-0.5">
						<TextSkeleton line="body-sm" width="w-20" />
						<TextSkeleton line="caption" width="w-140 max-w-full" />
					</div>

					<TextSkeleton line="body-sm" width="w-80 max-w-full" />

					<div className="flex flex-col gap-1">
						{RUNGS.map((rung) => (
							<Skeleton key={rung} className="h-11 w-full rounded-md" />
						))}
					</div>

					<div className="flex flex-wrap items-end gap-3">
						<Skeleton className="h-9.5 w-28 rounded-md" />
						<Skeleton className="h-9.5 w-44 rounded-md" />
						<Skeleton className="h-9.5 w-40 rounded-md" />
					</div>
				</div>

				<TextSkeleton line="caption" width="w-120 max-w-full" />
			</SectionSkeleton>
		</ModulePageSkeleton>
	);
}
