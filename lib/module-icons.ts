import {
	Blocks,
	CalendarClock,
	Coins,
	DoorOpen,
	Gift,
	ScrollText,
	Shield,
	ShieldAlert,
	Sticker,
	Terminal,
	Ticket,
	TrendingUp,
	type LucideIcon
} from 'lucide-react';
import type { ModuleId } from '@/lib/types/modules';

export const moduleIcons: Record<ModuleId, LucideIcon> = {
	welcome: DoorOpen,
	moderation: Shield,
	automod: ShieldAlert,
	logging: ScrollText,
	levels: TrendingUp,
	economy: Coins,
	tickets: Ticket,
	'reaction-roles': Sticker,
	giveaways: Gift,
	'custom-commands': Terminal,
	scheduled: CalendarClock
};

export const fallbackModuleIcon: LucideIcon = Blocks;
