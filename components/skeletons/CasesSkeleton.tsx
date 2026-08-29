import {
	ManagementPageSkeleton,
	TableRowSkeleton,
	TableSkeleton
} from '@/components/management/PageSkeleton';
import { Skeleton, TextSkeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/cn';

const ROWS = 12;

const COLUMNS = [
	{ cell: 'w-21 shrink-0', head: 'w-8' },
	{ cell: 'w-33 shrink-0', head: 'w-12' },
	{ cell: 'w-39 shrink-0', head: 'w-13' },
	{ cell: 'w-34 shrink-0', head: 'w-18' },
	{ cell: 'min-w-0 flex-1', head: 'w-12' },
	{ cell: 'w-41 shrink-0', head: 'w-13' },
	{ cell: 'w-39 shrink-0', head: 'w-12' }
];

export function CasesSkeleton() {
	return (
		<ManagementPageSkeleton label="Cases" titleWidth="w-21" descriptionWidth="w-146">
			<div className="mt-6 flex flex-wrap items-center gap-3">
				<Skeleton className="h-9 w-44 shrink-0 rounded-md" />
				<Skeleton className="h-8.5 w-72 max-w-full shrink-0 rounded-md" />
			</div>

			<TableSkeleton
				className="mt-6"
				head={COLUMNS.map((column, index) => (
					<div key={index} className={cn('flex items-center px-4 py-3', column.cell)}>
						<TextSkeleton line="overline" width={column.head} />
					</div>
				))}
			>
				{Array.from({ length: ROWS }, (_, row) => (
					<TableRowSkeleton key={row}>
						<div className={cn('flex items-center px-4 py-3', COLUMNS[0]?.cell)}>
							<TextSkeleton line="body-sm" width="w-7" />
						</div>

						<div className={cn('flex items-center px-4 py-3', COLUMNS[1]?.cell)}>
							<Skeleton className="h-5 w-16 rounded-sm" />
						</div>

						<div className={cn('flex items-center gap-2 px-4 py-3', COLUMNS[2]?.cell)}>
							<Skeleton className="size-6 shrink-0 rounded-full" />
							<TextSkeleton line="body-sm" width="w-16" />
						</div>

						<div className={cn('flex items-center px-4 py-3', COLUMNS[3]?.cell)}>
							<TextSkeleton line="body-sm" width="w-14" />
						</div>

						<div className={cn('flex items-center px-4 py-3', COLUMNS[4]?.cell)}>
							<TextSkeleton line="body-sm" width="w-76 max-w-full" />
						</div>

						<div className={cn('flex items-center px-4 py-3', COLUMNS[5]?.cell)}>
							<TextSkeleton line="body-sm" width="w-18" />
						</div>

						<div className={cn('flex items-center px-4 py-3', COLUMNS[6]?.cell)}>
							<Skeleton className="h-5 w-16 rounded-sm" />
						</div>
					</TableRowSkeleton>
				))}
			</TableSkeleton>

			<div className="mt-3 flex flex-wrap items-center gap-3">
				<TextSkeleton line="caption" width="w-40" />
				<Skeleton className="h-8 w-44 rounded-md" />
			</div>
		</ManagementPageSkeleton>
	);
}
