import {
	FieldSkeleton,
	ModulePageSkeleton,
	SectionSkeleton
} from '@/components/modules/ModuleSkeleton';
import { Skeleton, TextSkeleton } from '@/components/ui/Skeleton';

const SWATCHES = [0, 1, 2, 3, 4, 5];

const BACKUP_ROWS = [0, 1];

const DANGER_ROWS = [0, 1];

export function SettingsSkeleton() {
	return (
		<ModulePageSkeleton label="Settings">
			<SectionSkeleton>
				<FieldSkeleton hint control="h-9.5" width="w-80" />
				<FieldSkeleton hint control="h-9.5" width="w-80" />
			</SectionSkeleton>

			<SectionSkeleton>
				<div className="flex flex-col gap-2">
					<TextSkeleton line="body-sm" width="w-36" />
					<div className="flex flex-wrap items-center gap-2">
						{SWATCHES.map((swatch) => (
							<Skeleton key={swatch} className="size-8 rounded-md" />
						))}
						<Skeleton className="h-9 w-28 rounded-md" />
					</div>
				</div>
				<FieldSkeleton hint control="h-9.5" width="w-80" />

				<div className="flex flex-col">
					<TextSkeleton line="body-sm" width="w-28" className="mb-0.5" />
					<TextSkeleton line="caption" width="w-120 max-w-full" className="mb-1.5" />
					<div className="flex items-center gap-4">
						<Skeleton className="size-16 shrink-0 rounded-full" />
						<Skeleton className="h-9 w-40 rounded-md" />
						<TextSkeleton line="caption" width="w-48" />
					</div>
				</div>
			</SectionSkeleton>

			<SectionSkeleton>
				{BACKUP_ROWS.map((row) => (
					<div key={row} className="rounded-lg border border-border p-4">
						<TextSkeleton line="body-sm" width="w-40" />
						<TextSkeleton line="body-sm" width="w-full max-w-120" className="mt-1" />
						<Skeleton className="mt-3 h-8 w-28 rounded-md" />
					</div>
				))}
			</SectionSkeleton>

			<SectionSkeleton>
				{DANGER_ROWS.map((row) => (
					<div key={row} className="rounded-lg border border-border p-4">
						<TextSkeleton line="body-sm" width="w-48" />
						<TextSkeleton line="body-sm" width="w-full max-w-120" className="mt-1" />
						<Skeleton className="mt-3 h-9 w-32 rounded-md" />
					</div>
				))}
			</SectionSkeleton>
		</ModulePageSkeleton>
	);
}
