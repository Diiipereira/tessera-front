import { Skeleton, TextSkeleton } from '@/components/ui/Skeleton';

const STATS = [0, 1, 2, 3];
const HEALTH_ROWS = [0, 1, 2];
const CARDS = [0, 1];
const CARD_ROWS = [0, 1, 2, 3, 4];

export function OverviewSkeleton() {
	return (
		<div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading overview">
			<div>
				<TextSkeleton line="h1" width="w-48" />
				<TextSkeleton line="body" width="w-80 max-w-full" />
			</div>

			<div className="grid grid-cols-[repeat(auto-fit,minmax(14rem,1fr))] gap-4">
				{STATS.map((index) => (
					<div key={index} className="rounded-lg border border-border bg-surface p-5">
						<TextSkeleton line="caption" width="w-28" className="mb-1" />
						<TextSkeleton line="h1" width="w-24" />
						<div className="mt-2 flex h-5.5 items-center">
							<Skeleton className="h-5 w-32 rounded-sm" />
						</div>
					</div>
				))}
			</div>

			<div className="grid gap-4 xl:grid-cols-3">
				<div className="rounded-lg border border-border bg-surface xl:col-span-2">
					<div className="flex flex-wrap items-center gap-3 border-b border-border p-5">
						<div className="min-w-0 flex-1">
							<TextSkeleton line="h4" width="w-24" />
							<TextSkeleton line="body-sm" width="w-64 max-w-full" />
						</div>
						<Skeleton className="h-8.5 w-32 rounded-md" />
					</div>
					<div className="flex flex-wrap gap-4 px-5 pt-4">
						<TextSkeleton line="caption" width="w-24" />
						<TextSkeleton line="caption" width="w-24" />
					</div>
					<div className="px-3 pt-3 pb-4">
						<Skeleton className="h-64 w-full rounded-md" />
					</div>
				</div>

				<div className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5">
					<div className="flex items-center gap-2">
						<TextSkeleton line="h4" width="w-32" className="min-w-0 flex-1" />
						<Skeleton className="h-5 w-16 shrink-0 rounded-sm" />
					</div>
					<div className="flex flex-col gap-2.5">
						{HEALTH_ROWS.map((index) => (
							<div key={index} className="flex items-center justify-between gap-4">
								<TextSkeleton line="body-sm" width="w-20" />
								<TextSkeleton line="body" width="w-14" />
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				{CARDS.map((card) => (
					<div key={card} className="rounded-lg border border-border bg-surface">
						<div className="flex items-center gap-3 border-b border-border p-5">
							<TextSkeleton line="h4" width="w-36" />
						</div>
						<div className="flex flex-col">
							{CARD_ROWS.map((row) => (
								<div
									key={row}
									className="flex items-center gap-3 border-b border-border p-4 last:border-0"
								>
									<Skeleton className="size-6 shrink-0 rounded-md" />
									<div className="min-w-0 flex-1">
										<TextSkeleton line="body-sm" width="w-3/4" />
										<TextSkeleton line="caption" width="w-1/3" className="h-5.5" />
									</div>
									<Skeleton className="h-5 w-14 shrink-0 rounded-sm" />
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
