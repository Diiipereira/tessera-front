import { Skeleton, TextSkeleton } from '@/components/ui/Skeleton';

const PARAGRAPHS = [
	['w-full', 'w-full', 'w-4/5'],
	['w-full', 'w-11/12', 'w-2/3'],
	['w-full', 'w-3/4']
];

const TABLE_ROWS = 5;

function ParagraphSkeleton({ widths }: { widths: string[] }) {
	return (
		<div>
			{widths.map((width, index) => (
				<TextSkeleton key={index} line="body" width={width} />
			))}
		</div>
	);
}

export function DocsSkeleton() {
	return (
		<>
			<main
				className="max-w-200 min-w-0 flex-1"
				aria-busy="true"
				aria-label="Loading documentation"
			>
				<div className="mb-4 flex h-5 items-center gap-1.5">
					<Skeleton className="h-3 w-10 rounded-sm" />
					<Skeleton className="h-3 w-20 rounded-sm" />
					<Skeleton className="h-3 w-28 rounded-sm" />
				</div>

				<div className="mb-8">
					<TextSkeleton line="h1" width="w-64" />
					<TextSkeleton line="body-lg" width="w-140 max-w-full" className="mt-2" />
				</div>

				<div className="flex flex-col gap-4">
					<ParagraphSkeleton widths={PARAGRAPHS[0] ?? []} />

					<div className="pt-4">
						<TextSkeleton line="h2" width="w-48" />
					</div>

					<ParagraphSkeleton widths={PARAGRAPHS[1] ?? []} />

					<div className="flex flex-col gap-4">
						{Array.from({ length: 3 }, (_, step) => (
							<div key={step} className="flex gap-3">
								<Skeleton className="mt-0.5 size-6 shrink-0 rounded-full" />
								<div className="min-w-0 flex-1">
									<TextSkeleton line="body" width="w-40" />
									<TextSkeleton line="body" width="w-full" className="mt-0.5" />
								</div>
							</div>
						))}
					</div>

					<Skeleton className="h-24 w-full rounded-lg" />

					<div className="pt-4">
						<TextSkeleton line="h2" width="w-36" />
					</div>

					<div className="overflow-hidden rounded-lg border border-border">
						<div className="flex h-10 items-center gap-4 border-b border-border bg-surface-sunken px-4">
							<TextSkeleton line="overline" width="w-14" className="w-32 shrink-0" />
							<TextSkeleton line="overline" width="w-10" className="w-24 shrink-0" />
							<TextSkeleton line="overline" width="w-12" className="min-w-0 flex-1" />
						</div>
						{Array.from({ length: TABLE_ROWS }, (_, row) => (
							<div
								key={row}
								className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0"
							>
								<TextSkeleton line="body-sm" width="w-20" className="w-32 shrink-0" />
								<TextSkeleton line="body-sm" width="w-16" className="w-24 shrink-0" />
								<TextSkeleton line="body-sm" width="w-full" className="min-w-0 flex-1" />
							</div>
						))}
					</div>

					<ParagraphSkeleton widths={PARAGRAPHS[2] ?? []} />
				</div>

				<div className="mt-12 flex flex-wrap gap-4 border-t border-border pt-8">
					{Array.from({ length: 2 }, (_, card) => (
						<div
							key={card}
							className="min-w-0 flex-1 rounded-lg border border-border bg-surface p-4"
						>
							<TextSkeleton line="caption" width="w-16" />
							<TextSkeleton line="body" width="w-32" className="mt-1" />
						</div>
					))}
				</div>
			</main>

			<aside className="sticky top-24 hidden w-52 shrink-0 xl:block">
				<div className="flex flex-col gap-2">
					<TextSkeleton line="overline" width="w-20" />
					<div className="flex flex-col gap-1 border-l border-border">
						{Array.from({ length: 4 }, (_, entry) => (
							<div key={entry} className="flex h-6 items-center pl-3">
								<Skeleton className="h-3 w-24 rounded-sm" />
							</div>
						))}
					</div>
				</div>
			</aside>
		</>
	);
}
