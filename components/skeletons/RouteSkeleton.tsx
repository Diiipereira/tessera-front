import type { ReactNode } from 'react';
import { AuditSkeleton } from './AuditSkeleton';
import { AutoModSkeleton } from './AutoModSkeleton';
import { CasesSkeleton } from './CasesSkeleton';
import { CommandsSkeleton } from './CommandsSkeleton';
import { CustomCommandsSkeleton } from './CustomCommandsSkeleton';
import { EconomySkeleton } from './EconomySkeleton';
import { GiveawaysSkeleton } from './GiveawaysSkeleton';
import { LevelsSkeleton } from './LevelsSkeleton';
import { LoggingSkeleton } from './LoggingSkeleton';
import { MembersSkeleton } from './MembersSkeleton';
import { ModerationSkeleton } from './ModerationSkeleton';
import { ModulesSkeleton } from './ModulesSkeleton';
import { OverviewSkeleton } from './OverviewSkeleton';
import { ReactionRolesSkeleton } from './ReactionRolesSkeleton';
import { ScheduledSkeleton } from './ScheduledSkeleton';
import { TicketsSkeleton } from './TicketsSkeleton';
import { WelcomeSkeleton } from './WelcomeSkeleton';

const byRoute: Record<string, ReactNode> = {
	'': (
		<div className="w-full p-6 sm:p-8">
			<OverviewSkeleton />
		</div>
	),
	modules: <ModulesSkeleton />,
	'modules/welcome': <WelcomeSkeleton />,
	'modules/moderation': <ModerationSkeleton />,
	'modules/automod': <AutoModSkeleton />,
	'modules/logging': <LoggingSkeleton />,
	'modules/levels': <LevelsSkeleton />,
	'modules/economy': <EconomySkeleton />,
	'modules/tickets': <TicketsSkeleton />,
	'modules/reaction-roles': <ReactionRolesSkeleton />,
	'modules/giveaways': <GiveawaysSkeleton />,
	'modules/custom-commands': <CustomCommandsSkeleton />,
	'modules/scheduled': <ScheduledSkeleton />,
	commands: <CommandsSkeleton />,
	members: <MembersSkeleton />,
	cases: <CasesSkeleton />,
	audit: <AuditSkeleton />
};

export function routeSkeleton(href: string): ReactNode {
	return byRoute[href.split('?')[0]?.split('/').slice(3).join('/') ?? ''] ?? null;
}
