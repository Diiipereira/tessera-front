import {
	ComposerSkeleton,
	FieldRowSkeleton,
	FieldSkeleton,
	LineSkeleton,
	ModulePageSkeleton,
	SectionSkeleton,
	SwitchSkeleton
} from '@/components/modules/ModuleSkeleton';
import { Skeleton, TextSkeleton } from '@/components/ui/Skeleton';

const LEADERBOARD_ROWS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const CURVE_CARDS = [0, 1, 2];

export function LevelsSkeleton() {
	return (
		<ModulePageSkeleton
			label="Levels"
			aside={
				<div className="rounded-lg border border-border bg-surface shadow-1">
					<div className="flex items-center gap-3 border-b border-border px-5 py-2">
						<TextSkeleton line="h4" width="w-32" className="min-w-0 flex-1" />
						<Skeleton className="h-5 w-14 shrink-0 rounded-sm" />
					</div>
					<div className="p-2">
						{LEADERBOARD_ROWS.map((row) => (
							<div key={row} className="flex items-center gap-3 px-3 py-2">
								<TextSkeleton line="body-sm" width="w-5" className="shrink-0" />
								<Skeleton className="size-7 shrink-0 rounded-full" />
								<TextSkeleton line="body-sm" className="min-w-0 flex-1" />
								<TextSkeleton line="body-sm" width="w-12" className="shrink-0" />
							</div>
						))}
					</div>
				</div>
			}
		>
			<SectionSkeleton>
				<FieldRowSkeleton
					fields={[
						{ width: 'w-32' },
						{ width: 'w-32' },
						{ width: 'w-40' },
						{ width: 'w-40', help: 1 }
					]}
				/>
			</SectionSkeleton>

			<SectionSkeleton>
				<FieldSkeleton hint width="w-32" />
				<Skeleton className="h-40 w-full rounded-md" />
				<div className="grid grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] gap-3">
					{CURVE_CARDS.map((card) => (
						<div key={card} className="rounded-md border border-border bg-surface-sunken p-3">
							<TextSkeleton line="caption" width="w-16" />
							<Skeleton className="mt-1.5 h-8.5 w-24" />
						</div>
					))}
				</div>
			</SectionSkeleton>

			<SectionSkeleton description={false}>
				<LineSkeleton width="w-40" />
				<SwitchSkeleton />
				<FieldSkeleton />
				<ComposerSkeleton />
			</SectionSkeleton>

			<SectionSkeleton>
				<div className="flex flex-col gap-3">
					<Skeleton className="h-15 w-full rounded-md" />
					<Skeleton className="h-15 w-full rounded-md" />
				</div>
			</SectionSkeleton>

			<SectionSkeleton>
				<FieldSkeleton />
				<FieldSkeleton />
			</SectionSkeleton>

			<SectionSkeleton danger>
				<Skeleton className="h-9 w-44 rounded-md" />
			</SectionSkeleton>
		</ModulePageSkeleton>
	);
}
