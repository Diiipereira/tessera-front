import {
	ManagementPageSkeleton,
	TableRowSkeleton,
	TableSkeleton
} from '@/components/management/PageSkeleton';
import { Skeleton, TextSkeleton } from '@/components/ui/Skeleton';
import { COMMAND_CATEGORIES } from '@/lib/commands';
import { cn } from '@/lib/utils/cn';

const CATEGORIES = COMMAND_CATEGORIES.length + 1;
const ROWS = 24;

const COLUMNS = [
	{ cell: 'min-w-0 flex-1', head: 'w-24' },
	{ cell: 'w-36 shrink-0', head: 'w-20' },
	{ cell: 'w-32 shrink-0', head: 'w-16' },
	{ cell: 'w-32 shrink-0', head: 'w-20' },
	{ cell: 'w-56 shrink-0', head: 'w-16' },
	{ cell: 'w-16 shrink-0', head: 'w-6' }
];

export function CommandsSkeleton() {
	return (
		<ManagementPageSkeleton label="Commands" action actionSize="h-9 w-48">
			<TextSkeleton line="caption" width="w-40" className="mt-1" />

			<div className="mt-6 grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)]">
				<aside>
					<TextSkeleton line="overline" width="w-20" className="mb-2" />
					<div className="flex flex-wrap gap-1 lg:flex-col">
						{Array.from({ length: CATEGORIES }, (_, item) => (
							<Skeleton key={item} className="h-8 w-full rounded-md" />
						))}
					</div>
				</aside>

				<div className="min-w-0">
					<div className="flex flex-wrap items-center gap-3">
						<Skeleton className="h-9 w-64 max-w-full rounded-md" />
						<div className="flex items-start gap-2">
							<Skeleton className="mt-0.75 size-4 shrink-0 rounded-xs" />
							<TextSkeleton line="body" width="w-24" />
						</div>
					</div>

					<TableSkeleton
						className="mt-4"
						minWidth="min-w-220"
						head={
							<>
								<div className="w-10 shrink-0 py-3 pl-4">
									<Skeleton className="mt-0.75 size-4 rounded-xs" />
								</div>
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
								<div className="w-10 shrink-0 py-3 pl-4">
									<Skeleton className="mt-0.75 size-4 rounded-xs" />
								</div>

								<div className={cn('px-4 py-3', COLUMNS[0]?.cell)}>
									<TextSkeleton line="body" width="w-32" />
									<TextSkeleton line="caption" width="w-64 max-w-full" />
								</div>

								<div className={cn('px-4 py-3', COLUMNS[1]?.cell)}>
									<div className="flex h-5.5 items-center">
										<Skeleton className="h-5 w-20 rounded-sm" />
									</div>
								</div>

								<div className={cn('px-4 py-3', COLUMNS[2]?.cell)}>
									<TextSkeleton line="body-sm" width="w-10" className="justify-end" />
								</div>

								<div className={cn('px-4 py-3', COLUMNS[3]?.cell)}>
									<Skeleton className="h-8 w-16 rounded-md" />
								</div>

								<div className={cn('px-4 py-3', COLUMNS[4]?.cell)}>
									<Skeleton className="h-8 w-40 rounded-md" />
								</div>

								<div className={cn('px-4 py-3', COLUMNS[5]?.cell)}>
									<Skeleton className="mt-0.5 h-5 w-9 rounded-full" />
								</div>
							</TableRowSkeleton>
						))}
					</TableSkeleton>
				</div>
			</div>
		</ManagementPageSkeleton>
	);
}
