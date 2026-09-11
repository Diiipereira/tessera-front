import {
	ComposerSkeleton,
	DiscordPreviewSkeleton,
	FieldSkeleton,
	ModulePageSkeleton,
	SectionSkeleton,
	SwitchSkeleton
} from '@/components/modules/ModuleSkeleton';
import { TextSkeleton } from '@/components/ui/Skeleton';

const VARIABLE_CHIPS = ['w-15', 'w-17', 'w-17', 'w-14'];

export function GameAlertsSkeleton() {
	return (
		<ModulePageSkeleton
			label="Free games"
			headerAction
			headerActionSize="h-8 w-28"
			aside={
				<div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-1">
					<TextSkeleton line="h4" width="w-24" />

					<DiscordPreviewSkeleton embed />

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
			</SectionSkeleton>

			<SectionSkeleton>
				<ComposerSkeleton embed chips={VARIABLE_CHIPS} />
				<TextSkeleton line="caption" width="w-96 max-w-full" />
				<SwitchSkeleton />
			</SectionSkeleton>
		</ModulePageSkeleton>
	);
}
