import {
	DiscordPreviewSkeleton,
	FieldSkeleton,
	ModulePageSkeleton,
	SectionSkeleton,
	SwitchSkeleton
} from '@/components/modules/ModuleSkeleton';
import { TextSkeleton } from '@/components/ui/Skeleton';

export function GameAlertsSkeleton() {
	return (
		<ModulePageSkeleton
			label="Free games"
			headerAction
			headerActionSize="h-8 w-28"
			aside={
				<div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-1">
					<TextSkeleton line="h4" width="w-24" />

					<DiscordPreviewSkeleton embed link />

					<div>
						<TextSkeleton line="caption" />
						<TextSkeleton line="caption" width="w-2/3" />
					</div>
				</div>
			}
		>
			<SectionSkeleton>
				<FieldSkeleton hint />
			</SectionSkeleton>

			<SectionSkeleton>
				<SwitchSkeleton />
			</SectionSkeleton>

			<SectionSkeleton>
				<FieldSkeleton />
				<SwitchSkeleton />
			</SectionSkeleton>

			<SectionSkeleton>
				<SwitchSkeleton />
			</SectionSkeleton>
		</ModulePageSkeleton>
	);
}
