import type { TenantDailyPoint } from '@/lib/types/admin';

export const TENANT_SERIES_KEYS = ['messages', 'commands'] as const;

export type TenantSeriesKey = (typeof TENANT_SERIES_KEYS)[number];

export const TENANT_SERIES_LABELS: Record<TenantSeriesKey, string> = {
	messages: 'Messages',
	commands: 'Commands'
};

export const TENANT_SERIES_DOTS: Record<TenantSeriesKey, string> = {
	messages: 'bg-chart-1',
	commands: 'bg-chart-2'
};

export type TenantChartPalette = {
	series: Record<TenantSeriesKey, string>;
	axis: string;
	grid: string;
	text: string;
	tooltipBg: string;
	tooltipFg: string;
	tooltipBorder: string;
};

type TenantSeriesOption = {
	name: string;
	type: 'line';
	smooth: number;
	symbol: 'none';
	sampling: 'lttb';
	yAxisIndex: number;
	lineStyle: { width: number; color: string };
	itemStyle: { color: string };
	areaStyle: { color: string; opacity: number };
	emphasis: { focus: 'series' };
	data: number[];
};

export type TenantActivityOption = {
	animationDuration: number;
	grid: {
		left: number;
		right: number;
		top: number;
		bottom: number;
		outerBoundsMode: 'same';
		outerBoundsContain: 'axisLabel';
	};
	tooltip: Record<string, unknown>;
	xAxis: Record<string, unknown>;
	yAxis: Record<string, unknown>[];
	series: TenantSeriesOption[];
};

export function dayLabel(day: string): string {
	const parts = day.split('-');
	return parts.length === 3 ? `${parts[2] ?? ''}/${parts[1] ?? ''}` : day;
}

export function isSilent(points: TenantDailyPoint[]): boolean {
	return points.length > 0 && points.every((point) => point.commands === 0 && point.messages === 0);
}

export function buildTenantActivityOption(
	points: TenantDailyPoint[],
	palette: TenantChartPalette
): TenantActivityOption {
	const axis = {
		type: 'value' as const,
		splitNumber: 4,
		axisLine: { show: false },
		axisTick: { show: false },
		axisLabel: { color: palette.text, fontSize: 12, margin: 12 }
	};

	return {
		animationDuration: 260,
		grid: {
			left: 4,
			right: 4,
			top: 8,
			bottom: 0,
			outerBoundsMode: 'same',
			outerBoundsContain: 'axisLabel'
		},
		tooltip: {
			trigger: 'axis',
			backgroundColor: palette.tooltipBg,
			borderColor: palette.tooltipBorder,
			borderWidth: 1,
			padding: [8, 10],
			textStyle: { color: palette.tooltipFg, fontSize: 12 },
			axisPointer: { type: 'line', lineStyle: { color: palette.axis, width: 1 } }
		},
		xAxis: {
			type: 'category',
			data: points.map((point) => dayLabel(point.day)),
			boundaryGap: false,
			axisLine: { lineStyle: { color: palette.axis } },
			axisTick: { show: false },
			axisLabel: { color: palette.text, fontSize: 12, margin: 12, hideOverlap: true },
			splitLine: { show: false }
		},
		yAxis: [
			{ ...axis, splitLine: { lineStyle: { color: palette.grid, type: 'solid' } } },
			{ ...axis, splitLine: { show: false } }
		],
		series: TENANT_SERIES_KEYS.map((key, index) => ({
			name: TENANT_SERIES_LABELS[key],
			type: 'line' as const,
			smooth: 0.35,
			symbol: 'none' as const,
			sampling: 'lttb' as const,
			yAxisIndex: index,
			lineStyle: { width: 2, color: palette.series[key] },
			itemStyle: { color: palette.series[key] },
			areaStyle: { color: palette.series[key], opacity: 0.12 },
			emphasis: { focus: 'series' as const },
			data: points.map((point) => point[key])
		}))
	};
}
