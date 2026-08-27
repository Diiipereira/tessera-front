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
	{ label: 'Features', href: '/#features', external: false },
	{ label: 'Pricing', href: '/pricing', external: false },
	{ label: 'Docs', href: '/docs', external: false },
	{ label: 'Support', href: BRAND.supportUrl, external: true }
] as const;

export const FOOTER_COLUMNS = [
	{
		title: 'Product',
		links: [
			{ label: 'Features', href: '/#features', external: false },
			{ label: 'Pricing', href: '/pricing', external: false },
			{ label: 'Add to Discord', href: INVITE_HREF, external: true }
		]
	},
	{
		title: 'Help',
		links: [
			{ label: 'Documentation', href: '/docs', external: false },
			{ label: 'Support server', href: BRAND.supportUrl, external: true }
		]
	},
	{
		title: 'Legal',
		links: [
			{ label: 'Terms', href: '/terms', external: false },
			{ label: 'Privacy', href: '/privacy', external: false }
		]
	}
] as const;

export type TrustStat = { value: string; label: string };

export const TRUST_STATS: TrustStat[] = [
	{ value: '12,400', label: 'servers running it' },
	{ value: '4.1M', label: 'members covered' },
	{ value: '99.9%', label: 'uptime last 90 days' }
];

export type ModuleHighlight = {
	id: string;
	icon: LucideIcon;
	title: string;
	body: string;
};

export const MODULE_HIGHLIGHTS: ModuleHighlight[] = [
	{
		id: 'moderation',
		icon: Shield,
		title: 'Moderation',
		body: 'Warn, timeout, kick and ban with a reason attached. Warning escalation runs the punishment ladder for you.'
	},
	{
		id: 'automod',
		icon: ShieldAlert,
		title: 'AutoMod',
		body: 'Rules for invites, spam, links and words, with a playground that shows which rules a sample message trips.'
	},
	{
		id: 'welcome',
		icon: DoorOpen,
		title: 'Welcome',
		body: 'Greet new members with plain text or an embed, and hand out their first roles on the way in.'
	},
	{
		id: 'levels',
		icon: TrendingUp,
		title: 'Levels',
		body: 'XP from messages and voice, role rewards per level, and a leaderboard your members can actually see.'
	},
	{
		id: 'tickets',
		icon: Ticket,
		title: 'Tickets',
		body: 'Panels that open a private channel, with a form builder, transcripts and auto-close.'
	},
	{
		id: 'giveaways',
		icon: Gift,
		title: 'Giveaways',
		body: 'Entry requirements by role or level, bonus entries, live countdowns and a one-click reroll.'
	}
];

export const MIRROR_POINTS: string[] = [
	'Nothing auto-saves. A save bar names how many settings changed before anything reaches your server.',
	'If a slash command changes the same setting while your form is open, the bar offers Reload or Keep mine.',
	'Every change is in the audit log with the actor, a before/after diff and whether it came from Web or Slash.'
];

export type HelpCard = {
	id: string;
	icon: LucideIcon;
	tile: string;
	title: string;
	body: string;
	meta: string;
} & ({ external: true; href: string } | { external: false; href: DocsHref });

export const HELP_CARDS: HelpCard[] = [
	{
		id: 'docs',
		icon: BookOpen,
		tile: 'bg-primary-subtle text-primary',
		title: 'Documentation',
		body: 'Setup guides and a page per module, with the exact permissions each one needs.',
		meta: 'eleven modules, one page each',
		external: false,
		href: '/docs'
	},
	{
		id: 'support',
		icon: LifeBuoy,
		tile: 'bg-info-subtle text-info',
		title: 'Support server',
		body: 'Ask in Discord and get an answer from someone who works on the bot.',
		meta: 'usually under 2 hours',
		external: true,
		href: BRAND.supportUrl
	},
	{
		id: 'commands',
		icon: SquareSlash,
		tile: 'bg-surface-sunken text-text-muted',
		title: 'Command reference',
		body: 'Every slash command with its usage, required permission and cooldown.',
		meta: 'grouped by category',
		external: false,
		href: '/docs/commands'
	},
	{
		id: 'status',
		icon: Activity,
		tile: 'bg-success-subtle text-success',
		title: 'Status & incidents',
		body: 'Live shard health, latency and a history of anything that went wrong.',
		meta: 'all systems operational',
		external: true,
		href: BRAND.statusUrl
	}
];

export type FaqEntry = { id: string; question: string; answer: string };

export const FAQ_ENTRIES: FaqEntry[] = [
	{
		id: 'free',
		question: 'Is it free?',
		answer: `Yes, on unlimited servers. Pro raises the module limits — more AutoMod rules, more custom commands, longer audit retention — and Ultimate adds the economy module.`
	},
	{
		id: 'administrator',
		question: 'Do I need to give it Administrator?',
		answer: `No. ${BRAND.name} asks for the permissions each module needs, and the dashboard tells you exactly which permission is missing where you make the choice — not after you save.`
	},
	{
		id: 'slash',
		question: 'What happens if my moderators use slash commands instead?',
		answer:
			'Nothing breaks. Both write the same state, and every change lands in the audit log tagged Web or Slash so you can see where it came from.'
	},
	{
		id: 'export',
		question: 'Can I export my configuration?',
		answer:
			'Yes. Settings export to a single file, and importing shows a diff of what would change before anything is applied.'
	}
];
