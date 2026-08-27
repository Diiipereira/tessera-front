import {
	Blocks,
	CalendarClock,
	Coins,
	CreditCard,
	DoorOpen,
	FileClock,
	Gavel,
	Gift,
	LayoutDashboard,
	ScrollText,
	Settings,
	Shield,
	ShieldAlert,
	SquareSlash,
	Sticker,
	Terminal,
	Ticket,
	TrendingUp,
	UserCog,
	Users,
	type LucideIcon
} from 'lucide-react';

export type NavItem = {
	id: string;
	label: string;
	path: string;
	icon: LucideIcon;
	premium?: boolean;
};

export type NavGroup = {
	id: string;
	label: string;
	items: NavItem[];
};

export type GuildHref = `/servers/${string}`;

export type Crumb = {
	label: string;
	href?: GuildHref;
};

export const navGroups: NavGroup[] = [
	{
		id: 'overview',
		label: 'Overview',
		items: [
			{ id: 'overview', label: 'Overview', path: '', icon: LayoutDashboard },
			{ id: 'modules', label: 'Modules', path: '/modules', icon: Blocks }
		]
	},
	{
		id: 'modules',
		label: 'Modules',
		items: [
			{ id: 'welcome', label: 'Welcome', path: '/modules/welcome', icon: DoorOpen },
			{ id: 'moderation', label: 'Moderation', path: '/modules/moderation', icon: Shield },
			{ id: 'automod', label: 'AutoMod', path: '/modules/automod', icon: ShieldAlert },
			{ id: 'logging', label: 'Logging', path: '/modules/logging', icon: ScrollText },
			{ id: 'levels', label: 'Levels', path: '/modules/levels', icon: TrendingUp },
			{ id: 'economy', label: 'Economy', path: '/modules/economy', icon: Coins, premium: true },
			{ id: 'tickets', label: 'Tickets', path: '/modules/tickets', icon: Ticket },
			{
				id: 'reaction-roles',
				label: 'Reaction roles',
				path: '/modules/reaction-roles',
				icon: Sticker
			},
			{ id: 'giveaways', label: 'Giveaways', path: '/modules/giveaways', icon: Gift },
			{
				id: 'custom-commands',
				label: 'Custom commands',
				path: '/modules/custom-commands',
				icon: Terminal
			},
			{
				id: 'scheduled',
				label: 'Scheduled messages',
				path: '/modules/scheduled',
				icon: CalendarClock,
				premium: true
			}
		]
	},
	{
		id: 'management',
		label: 'Management',
		items: [
			{ id: 'commands', label: 'Commands', path: '/commands', icon: SquareSlash },
			{ id: 'members', label: 'Members', path: '/members', icon: Users },
			{ id: 'cases', label: 'Cases', path: '/cases', icon: Gavel },
			{ id: 'audit', label: 'Audit log', path: '/audit', icon: FileClock }
		]
	},
	{
		id: 'server',
		label: 'Server',
		items: [
			{ id: 'team', label: 'Team', path: '/team', icon: UserCog },
			{ id: 'billing', label: 'Billing', path: '/billing', icon: CreditCard },
			{ id: 'settings', label: 'Settings', path: '/settings', icon: Settings }
		]
	}
];

export function guildHref(guildId: string, path: string): GuildHref {
	return `/servers/${guildId}${path}`;
}

export function findNavItem(guildId: string, pathname: string): NavItem | undefined {
	for (const group of navGroups) {
		for (const item of group.items) {
			if (guildHref(guildId, item.path) === pathname) return item;
		}
	}
	return undefined;
}

export function findActiveNavItem(guildId: string, pathname: string): NavItem | undefined {
	let best: NavItem | undefined;
	let bestLength = -1;

	for (const group of navGroups) {
		for (const item of group.items) {
			const href = guildHref(guildId, item.path);
			const matches = pathname === href || (item.path !== '' && pathname.startsWith(`${href}/`));
			if (matches && item.path.length > bestLength) {
				best = item;
				bestLength = item.path.length;
			}
		}
	}

	return best;
}

export function breadcrumbsFor(guildId: string, pathname: string): Crumb[] {
	const item = findActiveNavItem(guildId, pathname);
	if (!item) return [];

	const href = guildHref(guildId, item.path);
	const rest = pathname.slice(href.length).replace(/^\//, '');
	const crumbs: Crumb[] = [];

	if (item.path.startsWith('/modules/')) {
		crumbs.push({ label: 'Modules', href: guildHref(guildId, '/modules') });
	}

	if (rest === '') {
		crumbs.push({ label: item.label });
		return crumbs;
	}

	crumbs.push({ label: item.label, href });
	crumbs.push({ label: /^\d+$/.test(rest) ? `#${rest}` : rest });
	return crumbs;
}
