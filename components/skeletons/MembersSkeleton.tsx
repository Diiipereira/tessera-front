import {
	ManagementPageSkeleton,
	TableRowSkeleton,
	TableSkeleton
} from '@/components/management/PageSkeleton';
import { Skeleton, TextSkeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils/cn';

const ROWS = 14;

const COLUMNS = [
	{ cell: 'min-w-0 flex-1', head: 'w-16' },
	{ cell: 'w-56 shrink-0', head: 'w-12' },
	{ cell: 'w-32 shrink-0', head: 'w-14' },
	{ cell: 'w-24 shrink-0', head: 'w-12' },
	{ cell: 'w-28 shrink-0', head: 'w-14' },
	{ cell: 'w-24 shrink-0', head: 'w-14' },
	{ cell: 'w-32 shrink-0', head: 'w-16' }
];

export function MembersSkeleton() {
	return (
		<ManagementPageSkeleton label="Members">
			<div className="mt-6 flex flex-wrap items-center gap-3">
				<Skeleton className="h-9 w-72 max-w-full rounded-md" />
				<Skeleton className="h-9 w-44 shrink-0 rounded-md" />
				<Skeleton className="h-9 w-40 shrink-0 rounded-md" />
				<Skeleton className="ml-auto h-9 w-44 shrink-0 rounded-md" />
			</div>

			<TableSkeleton
				className="mt-6"
				head={COLUMNS.map((column, index) => (
					<div key={index} className={cn('px-4 py-3', column.cell)}>
						<TextSkeleton line="overline" width={column.head} />
					</div>
				))}
			>
				{Array.from({ length: ROWS }, (_, row) => (
					<TableRowSkeleton key={row}>
						<div className={cn('px-4 py-3', COLUMNS[0]?.cell)}>
							<div className="flex items-center gap-2.5">
								<Skeleton className="size-6 shrink-0 rounded-full" />
								<div className="min-w-0">
									<TextSkeleton line="body" width="w-24" />
									<TextSkeleton line="caption" width="w-32" />
								</div>
							</div>
						</div>

						<div className={cn('px-4 py-3', COLUMNS[1]?.cell)}>
							<div className="flex flex-wrap items-center gap-1.5">
								<Skeleton className="h-5 w-20 shrink-0 rounded-sm" />
								<Skeleton className="h-5 w-16 shrink-0 rounded-sm" />
							</div>
						</div>

						<div className={cn('px-4 py-3', COLUMNS[2]?.cell)}>
							<TextSkeleton line="body-sm" width="w-20" />
						</div>

						<div className={cn('px-4 py-3', COLUMNS[3]?.cell)}>
							<TextSkeleton line="body-sm" width="w-6" className="justify-end" />
						</div>

						<div className={cn('px-4 py-3', COLUMNS[4]?.cell)}>
							<TextSkeleton line="body-sm" width="w-12" className="justify-end" />
						</div>

						<div className={cn('px-4 py-3', COLUMNS[5]?.cell)}>
							<TextSkeleton line="body-sm" width="w-4" className="justify-end" />
						</div>

						<div className={cn('px-4 py-3', COLUMNS[6]?.cell)}>
							<div className="flex h-5.5 items-center">
								<Skeleton className="h-5 w-20 rounded-sm" />
							</div>
						</div>
					</TableRowSkeleton>
				))}
			</TableSkeleton>

			<TextSkeleton line="caption" width="w-56" className="mt-3" />
		</ManagementPageSkeleton>
	);
}
