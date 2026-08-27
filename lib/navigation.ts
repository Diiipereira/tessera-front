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
	path: string;
	icon: LucideIcon;
	premium?: boolean;
};

export type NavGroup = {
	id: string;
	items: NavItem[];
};

export type GuildHref = `/servers/${string}`;

export type Crumb =
	{ kind: 'nav'; id: string; href?: GuildHref } | { kind: 'text'; text: string; href?: GuildHref };

export const navGroups: NavGroup[] = [
	{
		id: 'overview',
		items: [
			{ id: 'overview', path: '', icon: LayoutDashboard },
			{ id: 'modules', path: '/modules', icon: Blocks }
		]
	},
	{
		id: 'modules',
		items: [
			{ id: 'welcome', path: '/modules/welcome', icon: DoorOpen },
			{ id: 'moderation', path: '/modules/moderation', icon: Shield },
			{ id: 'automod', path: '/modules/automod', icon: ShieldAlert },
			{ id: 'logging', path: '/modules/logging', icon: ScrollText },
			{ id: 'levels', path: '/modules/levels', icon: TrendingUp },
			{ id: 'economy', path: '/modules/economy', icon: Coins, premium: true },
			{ id: 'tickets', path: '/modules/tickets', icon: Ticket },
			{ id: 'reaction-roles', path: '/modules/reaction-roles', icon: Sticker },
			{ id: 'giveaways', path: '/modules/giveaways', icon: Gift },
			{ id: 'custom-commands', path: '/modules/custom-commands', icon: Terminal },
			{ id: 'scheduled', path: '/modules/scheduled', icon: CalendarClock, premium: true }
		]
	},
	{
		id: 'management',
		items: [
			{ id: 'commands', path: '/commands', icon: SquareSlash },
			{ id: 'members', path: '/members', icon: Users },
			{ id: 'cases', path: '/cases', icon: Gavel },
			{ id: 'audit', path: '/audit', icon: FileClock }
		]
	},
	{
		id: 'server',
		items: [
			{ id: 'team', path: '/team', icon: UserCog },
			{ id: 'billing', path: '/billing', icon: CreditCard },
			{ id: 'settings', path: '/settings', icon: Settings }
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
		crumbs.push({ kind: 'nav', id: 'modules', href: guildHref(guildId, '/modules') });
	}

	if (rest === '') {
		crumbs.push({ kind: 'nav', id: item.id });
		return crumbs;
	}

	crumbs.push({ kind: 'nav', id: item.id, href });
	crumbs.push({ kind: 'text', text: /^\d+$/.test(rest) ? `#${rest}` : rest });
	return crumbs;
}
