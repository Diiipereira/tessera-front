import {
	ManagementPageSkeleton,
	TableRowSkeleton,
	TableSkeleton
} from '@/components/management/PageSkeleton';
import { Skeleton, TextSkeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/cn';

const ROWS = 20;

const COLUMNS = [
	{ cell: 'min-w-0 flex-1', head: 'w-24' },
	{ cell: 'w-40 shrink-0', head: 'w-20' },
	{ cell: 'w-24 shrink-0', head: 'w-12' },
	{ cell: 'w-24 shrink-0', head: 'w-12' },
	{ cell: 'w-44 shrink-0', head: 'w-20' }
];

export function CommandsSkeleton() {
	return (
		<ManagementPageSkeleton label="Commands">
			<div className="mt-6 flex flex-wrap items-center gap-3">
				<Skeleton className="h-9 w-72 max-w-full rounded-md" />
				<Skeleton className="h-9 w-44 rounded-md" />
				<div className="flex items-start gap-2">
					<Skeleton className="mt-0.75 size-4 shrink-0 rounded-xs" />
					<TextSkeleton line="body" width="w-20" />
				</div>
				<Skeleton className="ml-auto h-8 w-40 rounded-md" />
			</div>

			<TextSkeleton line="caption" width="w-96 max-w-full" className="mt-3" />

			<TableSkeleton
				className="mt-6"
				minWidth="min-w-180"
				head={
					<>
						{COLUMNS.map((column, index) => (
							<div key={index} className={cn('px-4 py-3', column.cell)}>
								<TextSkeleton line="overline" width={column.head} />
							</div>
						))}
					</>
				}
			>
				{Array.from({ length: ROWS }, (_, row) => (
					<TableRowSkeleton key={row}>
						<div className={cn('px-4 py-3', COLUMNS[0]?.cell)}>
							<TextSkeleton line="body" width="w-28" />
						</div>

						<div className={cn('px-4 py-3', COLUMNS[1]?.cell)}>
							<div className="flex h-5.5 items-center">
								<Skeleton className="h-5 w-24 rounded-sm" />
							</div>
						</div>

						<div className={cn('px-4 py-3', COLUMNS[2]?.cell)}>
							<TextSkeleton line="body-sm" width="w-8" className="justify-end" />
						</div>

						<div className={cn('px-4 py-3', COLUMNS[3]?.cell)}>
							<TextSkeleton line="body-sm" width="w-6" className="justify-end" />
						</div>

						<div className={cn('px-4 py-3', COLUMNS[4]?.cell)}>
							<TextSkeleton line="body-sm" width="w-32" />
						</div>
					</TableRowSkeleton>
				))}
			</TableSkeleton>
		</ManagementPageSkeleton>
	);
}
