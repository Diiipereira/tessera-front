import { SectionSkeleton } from '@/components/modules/ModuleSkeleton';
import { ManagementPageSkeleton } from '@/components/management/PageSkeleton';
import { Skeleton, TextSkeleton } from '@/components/ui/Skeleton';

const SEATS = 4;

const ROLE_COLUMNS = ['owner', 'admin', 'moderator', 'viewer'];

const CAPABILITY_ROWS = Array.from({ length: 16 }, (_, row) => row);

const SEAT_COLUMN = {
	person: 'w-64 pr-4',
	seat: 'w-40 pr-4',
	grantedBy: 'w-44 pr-4',
	lastSeen: 'w-36 pr-4'
} as const;

function AlertSkeleton() {
	return (
		<div className="flex gap-3 rounded-lg border border-info bg-info-subtle p-4">
			<Skeleton className="mt-0.5 size-5 shrink-0 rounded-full" />
			<div className="min-w-0 flex-1">
				<TextSkeleton line="body" width="w-56" />
				<TextSkeleton line="body-sm" width="w-full max-w-160" className="mt-1" />
			</div>
		</div>
	);
}

function SeatTableSkeleton() {
	return (
		<div className="overflow-x-auto">
			<div className="w-full min-w-180">
				<div className="flex items-center border-b border-border py-2">
					{Object.values(SEAT_COLUMN).map((column) => (
						<div key={column} className={column}>
							<TextSkeleton line="overline" width="w-16" />
						</div>
					))}
					<div className="w-24" />
				</div>

				{Array.from({ length: SEATS }, (_, seat) => (
					<div key={seat} className="flex items-center border-b border-border py-3 last:border-0">
						<div className={SEAT_COLUMN.person}>
							<div className="flex items-center gap-2.5">
								<Skeleton className="size-8 shrink-0 rounded-full" />
								<div className="min-w-0">
									<TextSkeleton line="body" width="w-28" />
									<TextSkeleton line="caption" width="w-20" className="mt-0.5" />
								</div>
							</div>
						</div>

						<div className={SEAT_COLUMN.seat}>
							<Skeleton className="h-6 w-20 rounded-sm" />
						</div>

						<div className={SEAT_COLUMN.grantedBy}>
							<TextSkeleton line="body-sm" width="w-24" />
							<TextSkeleton line="caption" width="w-16" className="mt-0.5" />
						</div>

						<div className={SEAT_COLUMN.lastSeen}>
							<TextSkeleton line="body-sm" width="w-20" />
						</div>

						<div className="flex w-24 items-center justify-end gap-1">
							<Skeleton className="size-8 rounded-md" />
							<Skeleton className="size-8 rounded-md" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function MatrixSkeleton() {
	return (
		<div className="overflow-x-auto">
			<div className="w-full min-w-160">
				<div className="flex items-end border-b border-border py-2">
					<div className="min-w-0 flex-1 pr-4">
						<TextSkeleton line="overline" width="w-20" />
					</div>
					{ROLE_COLUMNS.map((role) => (
						<div key={role} className="flex w-24 flex-col items-center">
							<TextSkeleton line="overline" width="w-14" />
							<TextSkeleton line="caption" width="w-8" className="mt-0.5" />
						</div>
					))}
				</div>

				{CAPABILITY_ROWS.map((row) => (
					<div key={row} className="flex items-center border-b border-border py-3 last:border-0">
						<div className="min-w-0 flex-1 pr-4">
							<TextSkeleton line="body" width="w-40" />
							<TextSkeleton line="caption" width="w-72 max-w-full" className="mt-0.5" />
						</div>
						{ROLE_COLUMNS.map((role) => (
							<div key={role} className="flex w-24 justify-center">
								<Skeleton className="size-6 rounded-full" />
							</div>
						))}
					</div>
				))}
			</div>
		</div>
	);
}

export function TeamSkeleton() {
	return (
		<ManagementPageSkeleton
			label="Team"
			titleWidth="w-20"
			descriptionWidth="w-132"
			action
			actionSize="h-9 w-36"
		>
			<div className="mt-6 flex flex-col gap-6">
				<AlertSkeleton />

				<SectionSkeleton>
					<SeatTableSkeleton />
				</SectionSkeleton>

				<SectionSkeleton>
					<MatrixSkeleton />
				</SectionSkeleton>
			</div>
		</ManagementPageSkeleton>
	);
}
