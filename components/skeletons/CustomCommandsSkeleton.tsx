import { ModulePageSkeleton, SectionSkeleton } from '@/components/modules/ModuleSkeleton';
import { Skeleton, TextSkeleton } from '@/components/ui/Skeleton';

const COMMANDS = ['w-20', 'w-12', 'w-24'];

export function CustomCommandsSkeleton() {
	return (
		<ModulePageSkeleton label="Custom commands" headerAction headerActionSize="h-8 w-36">
			<SectionSkeleton>
				<div className="overflow-x-auto">
					<div className="flex min-w-160 flex-col">
						<div className="flex items-center gap-3 border-b border-border pb-2">
							<TextSkeleton line="overline" width="w-20" className="flex-1" />
							<TextSkeleton line="overline" width="w-24" className="flex-1" />
							<TextSkeleton line="overline" width="w-10" className="w-20 shrink-0" />
							<TextSkeleton line="overline" width="w-6" className="w-16 shrink-0" />
							<div className="w-20 shrink-0" />
						</div>

						{COMMANDS.map((width) => (
							<div
								key={width}
								className="flex items-center gap-3 border-b border-border py-3 last:border-0"
							>
								<TextSkeleton line="body-sm" width={width} className="flex-1" />
								<TextSkeleton line="body-sm" width="w-40" className="flex-1" />
								<TextSkeleton line="body-sm" width="w-10" className="w-20 shrink-0" />
								<div className="flex h-5.5 w-16 shrink-0 items-start">
									<Skeleton className="mt-0.5 h-5 w-9 rounded-full" />
								</div>
								<div className="flex w-20 shrink-0 items-center justify-end gap-1">
									<Skeleton className="size-8 rounded-md" />
									<Skeleton className="size-8 rounded-md" />
								</div>
							</div>
						))}
					</div>
				</div>
			</SectionSkeleton>
		</ModulePageSkeleton>
	);
}
