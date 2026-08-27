import { ManagementPageSkeleton, PanelSkeleton } from '@/components/management/PageSkeleton';
import { Skeleton, TextSkeleton } from '@/components/ui/Skeleton';

const ROWS = 12;

export function AuditSkeleton() {
	return (
		<ManagementPageSkeleton
			label="Audit log"
			titleWidth="w-30"
			descriptionWidth="w-124"
			action
			actionSize="h-9 w-25"
		>
			<div className="mt-6 flex flex-wrap items-center gap-3">
				<Skeleton className="h-9 w-68 max-w-full rounded-md" />
				<Skeleton className="h-9 w-44 shrink-0 rounded-md" />
				<Skeleton className="h-9 w-44 shrink-0 rounded-md" />
				<Skeleton className="h-8.5 w-46 shrink-0 rounded-md" />
			</div>

			<PanelSkeleton className="mt-6">
				{Array.from({ length: ROWS }, (_, row) => (
					<div
						key={row}
						className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-0"
					>
						<Skeleton className="size-4 shrink-0 rounded-xs" />
						<Skeleton className="size-6 shrink-0 rounded-full" />

						<div className="min-w-0 flex-1">
							<TextSkeleton line="body" width="w-72 max-w-full" />
							<TextSkeleton line="caption" width="w-44 max-w-full" />
						</div>

						<Skeleton className="h-5 w-11 shrink-0 rounded-sm" />
						<TextSkeleton
							line="caption"
							width="w-22"
							className="hidden w-32 shrink-0 justify-end sm:flex"
						/>
					</div>
				))}
			</PanelSkeleton>

			<TextSkeleton line="caption" width="w-52" className="mt-3" />
		</ManagementPageSkeleton>
	);
}
