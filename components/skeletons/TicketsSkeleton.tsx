import {
	FieldSkeleton,
	ModulePageSkeleton,
	SectionSkeleton,
	SwitchSkeleton
} from '@/components/modules/ModuleSkeleton';
import { TextSkeleton } from '@/components/ui/Skeleton';

export function TicketsSkeleton() {
	return (
		<ModulePageSkeleton label="Tickets" headerAction headerActionSize="h-8.5 w-60">
			<SectionSkeleton action actionSize="h-8 w-32">
				<TextSkeleton line="body-sm" width="w-96 max-w-full" />
			</SectionSkeleton>

			<SectionSkeleton>
				<FieldSkeleton hint />

				<SwitchSkeleton />

				<div className="flex flex-wrap items-end gap-4">
					<div className="w-56">
						<FieldSkeleton hint />
					</div>
					<div className="w-56">
						<FieldSkeleton hint />
					</div>
				</div>
			</SectionSkeleton>
		</ModulePageSkeleton>
	);
}
