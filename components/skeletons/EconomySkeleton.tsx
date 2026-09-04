import {
	FieldRowSkeleton,
	ModulePageSkeleton,
	SectionSkeleton
} from '@/components/modules/ModuleSkeleton';
import { Skeleton, TextSkeleton } from '@/components/ui/Skeleton';

const SYMBOL_PRESETS = [0, 1, 2, 3, 4, 5];
const SHOP_ITEMS = [0, 1, 2];
const TRANSACTIONS = [0, 1, 2, 3, 4];

function CommandGroupSkeleton({
	fields,
	blurbLines,
	footerLines = 0
}: {
	fields: { width: string; help?: number }[];
	blurbLines: number;
	footerLines?: number;
}) {
	return (
		<div className="flex flex-col gap-4 rounded-lg border border-border bg-surface-sunken p-4">
			<div>
				<TextSkeleton line="body-sm" width="w-16" />
				{Array.from({ length: blurbLines }, (_, line) => (
					<TextSkeleton
						key={line}
						line="caption"
						width={line === blurbLines - 1 ? 'w-2/3' : 'w-full'}
						className={line === 0 ? 'mt-0.5' : undefined}
					/>
				))}
			</div>

			<FieldRowSkeleton fields={fields} />

			{footerLines > 0 ? (
				<div className="mt-auto">
					{Array.from({ length: footerLines }, (_, line) => (
						<TextSkeleton
							key={line}
							line="body-sm"
							width={line === footerLines - 1 ? 'w-1/2' : 'w-full'}
						/>
					))}
				</div>
			) : null}
		</div>
	);
}

export function EconomySkeleton() {
	return (
		<ModulePageSkeleton label="Economy">
			<SectionSkeleton description={false}>
				<FieldRowSkeleton
					fields={[{ width: 'w-48' }, { width: 'w-28', help: 2 }, { width: 'w-40' }]}
				/>

				<div className="flex flex-wrap items-center gap-2">
					<TextSkeleton line="caption" width="w-32" />
					{SYMBOL_PRESETS.map((preset) => (
						<Skeleton key={preset} className="size-8 shrink-0 rounded-md" />
					))}
				</div>

				<TextSkeleton line="body-sm" width="w-72 max-w-full" />
			</SectionSkeleton>

			<SectionSkeleton>
				<div className="grid gap-4 lg:grid-cols-2">
					<CommandGroupSkeleton
						blurbLines={2}
						footerLines={1}
						fields={[{ width: 'w-32' }, { width: 'w-40' }, { width: 'w-36' }]}
					/>
					<CommandGroupSkeleton blurbLines={1} fields={[{ width: 'w-32' }, { width: 'w-44' }]} />
				</div>
			</SectionSkeleton>

			<SectionSkeleton>
				<CommandGroupSkeleton blurbLines={1} footerLines={1} fields={[{ width: 'w-36' }]} />
			</SectionSkeleton>

			<SectionSkeleton action>
				<div className="grid grid-cols-[repeat(auto-fill,minmax(16rem,1fr))] gap-4">
					{SHOP_ITEMS.map((item) => (
						<div
							key={item}
							className="flex flex-col gap-2 rounded-lg border border-border bg-surface-sunken p-4"
						>
							<div className="flex items-start gap-2">
								<TextSkeleton line="body" width="w-28" className="min-w-0 flex-1" />
								<TextSkeleton line="body" width="w-14" className="shrink-0" />
							</div>

							<div className="min-h-10">
								<TextSkeleton line="body-sm" width="w-full" />
							</div>

							<div className="flex flex-wrap gap-1.5">
								<Skeleton className="h-5 w-28 shrink-0 rounded-sm" />
								<Skeleton className="h-5 w-24 shrink-0 rounded-sm" />
								<Skeleton className="h-5 w-20 shrink-0 rounded-sm" />
							</div>

							<div className="mt-auto flex items-center gap-1 pt-1">
								<Skeleton className="h-8 w-16 shrink-0 rounded-md" />
								<div className="flex-1" />
								<Skeleton className="size-8 shrink-0 rounded-md" />
							</div>
						</div>
					))}
				</div>
			</SectionSkeleton>

			<SectionSkeleton action actionSize="h-8.5 w-84">
				<div className="flex flex-col">
					{TRANSACTIONS.map((row) => (
						<div
							key={row}
							className="flex items-center gap-3 border-b border-border py-3 last:border-0"
						>
							<Skeleton className="size-6 shrink-0 rounded-full" />
							<div className="min-w-0 flex-1">
								<TextSkeleton line="body-sm" width="w-3/5" />
								<TextSkeleton line="caption" width="w-24" className="h-5.5" />
							</div>
							<Skeleton className="h-5 w-16 shrink-0 rounded-sm" />
							<TextSkeleton line="body" width="w-24" className="shrink-0 justify-end" />
						</div>
					))}
				</div>
			</SectionSkeleton>

			<SectionSkeleton danger>
				<div className="flex flex-wrap items-center gap-3">
					<Skeleton className="h-9 w-44 shrink-0 rounded-md" />
					<TextSkeleton line="body-sm" width="w-140 max-w-full" />
				</div>
			</SectionSkeleton>
		</ModulePageSkeleton>
	);
}
