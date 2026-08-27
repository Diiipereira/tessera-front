import type { ActivityPoint } from '@/lib/types/overview';

export const SERIES_KEYS = ['messages', 'commands', 'joins'] as const;

export type SeriesKey = (typeof SERIES_KEYS)[number];

export const SERIES_LABELS: Record<SeriesKey, string> = {
	messages: 'Messages',
	commands: 'Commands',
	joins: 'Joins'
};

export const SERIES_DOTS: Record<SeriesKey, string> = {
	messages: 'bg-chart-1',
	commands: 'bg-chart-2',
	joins: 'bg-chart-3'
};

export type ChartPalette = {
	series: Record<SeriesKey, string>;
	axis: string;
	grid: string;
	text: string;
	tooltipBg: string;
	tooltipFg: string;
	tooltipBorder: string;
};

type SeriesOption = {
	name: string;
	type: 'line';
	smooth: number;
	symbol: 'none';
	sampling: 'lttb';
	lineStyle: { width: number; color: string };
	itemStyle: { color: string };
	areaStyle: { color: string; opacity: number };
	emphasis: { focus: 'series' };
	data: number[];
};

export type ActivityOption = {
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
	yAxis: Record<string, unknown>;
	series: SeriesOption[];
};

export function buildActivityOption(
	points: ActivityPoint[],
	palette: ChartPalette
): ActivityOption {
	const labels = points.map((point) => point.label);

	return {
		animationDuration: 260,
		grid: {
			left: 4,
			right: 8,
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
			data: labels,
			boundaryGap: false,
			axisLine: { lineStyle: { color: palette.axis } },
			axisTick: { show: false },
			axisLabel: { color: palette.text, fontSize: 12, margin: 12, hideOverlap: true },
			splitLine: { show: false }
		},
		yAxis: {
			type: 'value',
			splitNumber: 4,
			axisLine: { show: false },
			axisTick: { show: false },
			axisLabel: { color: palette.text, fontSize: 12, margin: 12 },
			splitLine: { lineStyle: { color: palette.grid, type: 'solid' } }
		},
		series: SERIES_KEYS.map((key) => ({
			name: SERIES_LABELS[key],
			type: 'line' as const,
			smooth: 0.35,
			symbol: 'none' as const,
			sampling: 'lttb' as const,
			lineStyle: { width: 2, color: palette.series[key] },
			itemStyle: { color: palette.series[key] },
			areaStyle: { color: palette.series[key], opacity: 0.15 },
			emphasis: { focus: 'series' as const },
			data: points.map((point) => point[key])
		}))
	};
}
