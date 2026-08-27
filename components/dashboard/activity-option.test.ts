import { describe, expect, it } from 'vitest';
import type { ActivityPoint } from '@/lib/types/overview';
import { buildActivityOption, SERIES_KEYS, type ChartPalette } from './activity-option';

const palette: ChartPalette = {
	series: { messages: '#111111', commands: '#222222', joins: '#333333' },
	axis: '#aaaaaa',
	grid: '#bbbbbb',
	text: '#cccccc',
	tooltipBg: '#dddddd',
	tooltipFg: '#eeeeee',
	tooltipBorder: '#ffffff'
};

const points: ActivityPoint[] = [
	{ index: 0, label: 'Mon', messages: 10, commands: 4, joins: 1 },
	{ index: 1, label: 'Tue', messages: 20, commands: 8, joins: 2 },
	{ index: 2, label: 'Wed', messages: 30, commands: 12, joins: 3 }
];

describe('buildActivityOption', () => {
	it('emits exactly one series per key', () => {
		const option = buildActivityOption(points, palette);
		expect(option.series).toHaveLength(SERIES_KEYS.length);
		expect(option.series.map((series) => series.name)).toEqual(['Messages', 'Commands', 'Joins']);
	});

	it('gives each series its own data — no series shares another series values', () => {
		const option = buildActivityOption(points, palette);

		expect(option.series[0]?.data).toEqual([10, 20, 30]);
		expect(option.series[1]?.data).toEqual([4, 8, 12]);
		expect(option.series[2]?.data).toEqual([1, 2, 3]);

		const serialised = option.series.map((series) => JSON.stringify(series.data));
		expect(new Set(serialised).size).toBe(3);
	});

	it('gives each series its own colour on line, marker and area', () => {
		const option = buildActivityOption(points, palette);
		const colours = option.series.map((series) => series.lineStyle.color);

		expect(colours).toEqual(['#111111', '#222222', '#333333']);
		expect(new Set(colours).size).toBe(3);

		for (const series of option.series) {
			expect(series.itemStyle.color).toBe(series.lineStyle.color);
			expect(series.areaStyle.color).toBe(series.lineStyle.color);
		}
	});

	it('uses the point labels as the category axis', () => {
		const option = buildActivityOption(points, palette);
		expect(option.xAxis.data).toEqual(['Mon', 'Tue', 'Wed']);
	});

	it('lets the plot use the full width instead of centring the data', () => {
		const option = buildActivityOption(points, palette);
		expect(option.grid.outerBoundsMode).toBe('same');
		expect(option.grid.outerBoundsContain).toBe('axisLabel');
		expect(option.grid.left).toBeLessThanOrEqual(8);
		expect(option.grid.right).toBeLessThanOrEqual(8);
		expect(option.xAxis.boundaryGap).toBe(false);
	});

	it('handles an empty range without throwing', () => {
		const option = buildActivityOption([], palette);
		expect(option.series).toHaveLength(3);
		for (const series of option.series) expect(series.data).toEqual([]);
	});
});
