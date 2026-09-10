import {
	ComposerSkeleton,
	FieldSkeleton,
	PreviewSkeleton,
	SectionSkeleton
} from '@/components/modules/ModuleSkeleton';
import { Skeleton, TextSkeleton } from '@/components/ui/Skeleton';

export function EmbedWorkshopSkeleton() {
	return (
		<div className="w-full p-6 sm:p-8" aria-busy="true" aria-label="Loading Embeds">
			<header className="flex flex-wrap items-start gap-4">
				<div className="min-w-60 flex-1">
					<TextSkeleton line="h1" width="w-40" />
					<TextSkeleton line="body" width="w-120 max-w-full" />
				</div>
			</header>

			<div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
				<div className="flex min-w-0 flex-col gap-6">
					<SectionSkeleton>
						<ComposerSkeleton embed />
					</SectionSkeleton>

					<SectionSkeleton>
						<Skeleton className="h-40 w-full rounded-md" />
						<div className="flex items-center gap-2">
							<Skeleton className="h-8 w-32 rounded-md" />
							<Skeleton className="h-8 w-32 rounded-md" />
						</div>
					</SectionSkeleton>
				</div>

				<div className="flex min-w-0 flex-col gap-4">
					<section className="overflow-hidden rounded-lg border border-border bg-surface shadow-1">
						<header className="border-b border-border px-5 py-4">
							<TextSkeleton line="h4" width="w-24" />
							<TextSkeleton line="body-sm" width="w-72 max-w-full" className="mt-0.5" />
						</header>
						<div className="p-5">
							<PreviewSkeleton />
						</div>
					</section>

					<section className="overflow-hidden rounded-lg border border-border bg-surface shadow-1">
						<header className="border-b border-border px-5 py-4">
							<TextSkeleton line="h4" width="w-28" />
							<TextSkeleton line="body-sm" width="w-72 max-w-full" className="mt-0.5" />
						</header>
						<div className="flex flex-col gap-4 p-5">
							<FieldSkeleton />
							<Skeleton className="h-9 w-full rounded-md" />
							<TextSkeleton line="caption" width="w-64 max-w-full" />
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}
