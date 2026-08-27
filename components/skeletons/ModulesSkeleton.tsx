import { Skeleton, TextSkeleton } from '@/components/ui/Skeleton';
import { navGroups } from '@/lib/navigation';

const CARDS = navGroups.find((group) => group.id === 'modules')?.items.length ?? 0;

export function ModulesSkeleton() {
	return (
		<div className="w-full p-6 sm:p-8" aria-busy="true" aria-label="Loading modules">
			<div className="flex flex-col gap-4">
				<div>
					<TextSkeleton line="h1" width="w-40" />
					<TextSkeleton line="body" width="w-140 max-w-full" />
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<Skeleton className="h-9 w-80 max-w-full rounded-md" />
					<Skeleton className="h-9.5 w-84 max-w-full rounded-md" />
				</div>
			</div>

			<div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-5">
				{Array.from({ length: CARDS }, (_, index) => (
					<div
						key={index}
						className="flex flex-col rounded-lg border border-border bg-surface shadow-1"
					>
						<div className="flex items-start gap-3 p-5">
							<Skeleton className="size-10 shrink-0 rounded-lg" />
							<div className="min-w-0 flex-1">
								<TextSkeleton line="h4" width="w-32" />
								<TextSkeleton line="body-sm" className="mt-0.5" />
								<TextSkeleton line="body-sm" width="w-2/3" />
							</div>
							<Skeleton className="mt-0.5 h-5 w-9 shrink-0 rounded-full" />
						</div>

						<div className="mt-auto flex items-center gap-3 border-t border-border px-5 py-3">
							<Skeleton className="h-5 w-16 shrink-0 rounded-sm" />
							<div className="flex-1" />
							<TextSkeleton line="body-sm" width="w-20" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
