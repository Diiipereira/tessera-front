import { ModulePageSkeleton, SectionSkeleton } from '@/components/modules/ModuleSkeleton';
import { TextSkeleton } from '@/components/ui/Skeleton';

export function ReactionRolesSkeleton() {
	return (
		<ModulePageSkeleton label="Reaction roles">
			<SectionSkeleton description={false} action actionSize="h-8 w-32">
				<TextSkeleton line="body-sm" width="w-52" />
			</SectionSkeleton>
		</ModulePageSkeleton>
	);
}
