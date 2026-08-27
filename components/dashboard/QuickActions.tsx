import { ChevronRight, Gift, Megaphone, Ticket, UserPlus, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { guildHref } from '@/lib/navigation';

const actions: { id: string; label: string; hint: string; icon: LucideIcon; path: string }[] = [
	{
		id: 'announce',
		label: 'Send announcement',
		hint: 'Post to a channel as the bot',
		icon: Megaphone,
		path: '/modules/scheduled'
	},
	{
		id: 'ticket',
		label: 'Create ticket panel',
		hint: 'A button members press for help',
		icon: Ticket,
		path: '/modules/tickets'
	},
	{
		id: 'giveaway',
		label: 'Start a giveaway',
		hint: 'Timed draw with requirements',
		icon: Gift,
		path: '/modules/giveaways'
	},
	{
		id: 'invite',
		label: 'Invite a teammate',
		hint: 'Give someone dashboard access',
		icon: UserPlus,
		path: '/team'
	}
];

export function QuickActions({ guildId }: { guildId: string }) {
	return (
		<div className="flex flex-col rounded-lg border border-border bg-surface shadow-1">
			<div className="border-b border-border p-5">
				<h2 className="text-h4">Quick actions</h2>
			</div>

			<div className="flex flex-col">
				{actions.map((action) => {
					const Icon = action.icon;
					return (
						<Link
							key={action.id}
							href={guildHref(guildId, action.path)}
							className="flex items-center gap-3 border-b border-border p-4 text-text no-underline transition-colors duration-120 ease-out last:border-0 hover:bg-surface-hover hover:no-underline"
						>
							<span className="grid size-9 shrink-0 place-items-center rounded-md bg-primary-subtle">
								<Icon className="size-4 text-primary" aria-hidden="true" />
							</span>
							<span className="min-w-0 flex-1">
								<span className="block truncate text-body font-medium">{action.label}</span>
								<span className="block truncate text-caption font-normal text-text-muted">
									{action.hint}
								</span>
							</span>
							<ChevronRight className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
						</Link>
					);
				})}
			</div>
		</div>
	);
}
