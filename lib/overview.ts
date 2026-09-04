import type {
	ActivityPoint,
	ActivityRange,
	SetupChecklistItem,
	TrendDirection
} from '@/lib/types/overview';

export type BotStatusDto = {
	online: boolean;
	uptimeSeconds: number;
	latencyMs: number;
	shards: number;
	seenAt: string;
};

export type DayPointDto = {
	day: string;
	messages: number;
	commands: number;
	joins: number;
	leaves: number;
	modActions: number;
	ticketsOpened: number;
};

export type ChecklistItemDto = {
	key: string;
	done: boolean;
};

export type OverviewDto = {
	memberCount: number;
	openTickets: number;
	setupCompleted: boolean;
	modules: { enabled: number; total: number; needingSetup: number };
	checklist: ChecklistItemDto[];
	series: DayPointDto[];
	bot: BotStatusDto | null;
};

export type Counted = keyof Omit<DayPointDto, 'day'>;

export const ACTIVITY_RANGES: ActivityRange[] = ['7d', '30d', '90d'];

export const RANGE_DAYS: Record<ActivityRange, number> = { '7d': 7, '30d': 30, '90d': 90 };

export type Trend = {
	amount: number;
	direction: TrendDirection;
};

export const lastDays = (series: readonly DayPointDto[], days: number): DayPointDto[] =>
	series.slice(Math.max(0, series.length - days));

export const daysBefore = (series: readonly DayPointDto[], days: number): DayPointDto[] =>
	series.slice(Math.max(0, series.length - days * 2), Math.max(0, series.length - days));

export const sumOf = (points: readonly DayPointDto[], metric: Counted): number =>
	points.reduce((total, point) => total + point[metric], 0);

export const netJoins = (points: readonly DayPointDto[]): number =>
	sumOf(points, 'joins') - sumOf(points, 'leaves');

export function trendOf(current: number, previous: number): Trend {
	const amount = current - previous;

	return { amount, direction: amount === 0 ? 'flat' : amount > 0 ? 'up' : 'down' };
}

export function percentTrend(current: number, previous: number): Trend | null {
	if (previous === 0) return null;

	const change = Math.round(((current - previous) / previous) * 100);

	return { amount: change, direction: change === 0 ? 'flat' : change > 0 ? 'up' : 'down' };
}

export function toActivity(
	series: readonly DayPointDto[],
	labelOf: (day: string, range: ActivityRange) => string
): Record<ActivityRange, ActivityPoint[]> {
	const forRange = (range: ActivityRange): ActivityPoint[] =>
		lastDays(series, RANGE_DAYS[range]).map((point, index) => ({
			index,
			label: labelOf(point.day, range),
			messages: point.messages,
			commands: point.commands,
			joins: point.joins
		}));

	return { '7d': forRange('7d'), '30d': forRange('30d'), '90d': forRange('90d') };
}

export const toChecklist = (items: readonly ChecklistItemDto[]): SetupChecklistItem[] =>
	items.map((item) => ({ id: item.key, done: item.done, path: `/modules/${item.key}` }));

export type Uptime = {
	days: number;
	hours: number;
	minutes: number;
};

export function uptimeOf(seconds: number): Uptime {
	const whole = Math.max(0, Math.floor(seconds));

	return {
		days: Math.floor(whole / 86_400),
		hours: Math.floor((whole % 86_400) / 3600),
		minutes: Math.floor((whole % 3600) / 60)
	};
}
