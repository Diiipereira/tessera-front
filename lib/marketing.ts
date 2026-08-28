import {
	Activity,
	BookOpen,
	DoorOpen,
	Gift,
	LifeBuoy,
	Shield,
	ShieldAlert,
	SquareSlash,
	Ticket,
	TrendingUp,
	type LucideIcon
} from 'lucide-react';
import { BRAND } from '@/lib/brand';
import { INVITE_HREF } from '@/lib/discord-invite';
import type { DocsHref } from '@/lib/docs/types';

export const NAV_LINKS = [
	{ id: 'features', href: '/#features', external: false },
	{ id: 'pricing', href: '/pricing', external: false },
	{ id: 'docs', href: '/docs', external: false },
	{ id: 'support', href: BRAND.supportUrl, external: true }
] as const;

export const FOOTER_COLUMNS = [
	{
		id: 'product',
		links: [
			{ id: 'features', href: '/#features', external: false },
			{ id: 'pricing', href: '/pricing', external: false },
			{ id: 'invite', href: INVITE_HREF, external: true }
		]
	},
	{
		id: 'help',
		links: [
			{ id: 'documentation', href: '/docs', external: false },
			{ id: 'supportServer', href: BRAND.supportUrl, external: true }
		]
	},
	{
		id: 'legal',
		links: [
			{ id: 'terms', href: '/terms', external: false },
			{ id: 'privacy', href: '/privacy', external: false }
		]
	}
] as const;

export type TrustStat = { id: string; value: string };

export const TRUST_STATS: TrustStat[] = [
	{ id: 'servers', value: '12,400' },
	{ id: 'members', value: '4.1M' },
	{ id: 'uptime', value: '99.9%' }
];

export type ModuleHighlight = { id: string; icon: LucideIcon };

export const MODULE_HIGHLIGHTS: ModuleHighlight[] = [
	{ id: 'moderation', icon: Shield },
	{ id: 'automod', icon: ShieldAlert },
	{ id: 'welcome', icon: DoorOpen },
	{ id: 'levels', icon: TrendingUp },
	{ id: 'tickets', icon: Ticket },
	{ id: 'giveaways', icon: Gift }
];

export const MIRROR_POINTS = ['saveBar', 'conflict', 'audit'] as const;

export type HelpCard = { id: string; icon: LucideIcon; tile: string } & (
	{ external: true; href: string } | { external: false; href: DocsHref }
);

export const HELP_CARDS: HelpCard[] = [
	{
		id: 'docs',
		icon: BookOpen,
		tile: 'bg-primary-subtle text-primary',
		external: false,
		href: '/docs'
	},
	{
		id: 'support',
		icon: LifeBuoy,
		tile: 'bg-info-subtle text-info',
		external: true,
		href: BRAND.supportUrl
	},
	{
		id: 'commands',
		icon: SquareSlash,
		tile: 'bg-surface-sunken text-text-muted',
		external: false,
		href: '/docs/commands'
	},
	{
		id: 'status',
		icon: Activity,
		tile: 'bg-success-subtle text-success',
		external: true,
		href: BRAND.statusUrl
	}
];

export const FAQ_ENTRIES = ['free', 'administrator', 'slash', 'export'] as const;
