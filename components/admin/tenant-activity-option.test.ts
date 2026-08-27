import { describe, expect, it } from 'vitest';
import type { TenantDailyPoint } from '@/lib/types/admin';
import {
	buildTenantActivityOption,
	dayLabel,
	isSilent,
	TENANT_SERIES_KEYS,
	type TenantChartPalette
} from './tenant-activity-option';

const palette: TenantChartPalette = {
	series: { messages: '#111111', commands: '#222222' },
	axis: '#333333',
	grid: '#444444',
	text: '#555555',
	tooltipBg: '#666666',
	tooltipFg: '#777777',
	tooltipBorder: '#888888'
};

const points: TenantDailyPoint[] = [
	{ day: '2026-08-23', messages: 120, commands: 14, joins: 3, leaves: 1 },
	{ day: '2026-08-24', messages: 260, commands: 31, joins: 5, leaves: 2 },
	{ day: '2026-08-25', messages: 180, commands: 22, joins: 4, leaves: 0 }
];

describe('dayLabel', () => {
	it('shortens an ISO day to day and month', () => {
		expect(dayLabel('2026-08-25')).toBe('25/08');
	});

	it('leaves an unexpected shape alone rather than mangling it', () => {
		expect(dayLabel('unknown')).toBe('unknown');
	});
});

describe('isSilent', () => {
	it('is false when anything was recorded', () => {
		expect(isSilent(points)).toBe(false);
	});

	it('is true when every day is empty, which is the support signal', () => {
		expect(isSilent(points.map((point) => ({ ...point, messages: 0, commands: 0 })))).toBe(true);
	});

	it('is false for an empty window, because that is missing data not silence', () => {
		expect(isSilent([])).toBe(false);
	});
});

describe('buildTenantActivityOption', () => {
	it('builds one series per key, in order', () => {
		const option = buildTenantActivityOption(points, palette);

		expect(option.series).toHaveLength(TENANT_SERIES_KEYS.length);
		expect(option.series.map((series) => series.name)).toEqual(['Messages', 'Commands']);
	});

	it('carries the values through untouched', () => {
		const option = buildTenantActivityOption(points, palette);

		expect(option.series[0]?.data).toEqual([120, 260, 180]);
		expect(option.series[1]?.data).toEqual([14, 31, 22]);
	});

	it('gives each series its own axis, so a small count is not flattened', () => {
		const option = buildTenantActivityOption(points, palette);

		expect(option.yAxis).toHaveLength(2);
		expect(option.series.map((series) => series.yAxisIndex)).toEqual([0, 1]);
	});

	it('labels the x axis with the shortened days', () => {
		const option = buildTenantActivityOption(points, palette);

		expect(option.xAxis.data).toEqual(['23/08', '24/08', '25/08']);
	});

	it('takes every colour from the palette it was handed', () => {
		const option = buildTenantActivityOption(points, palette);

		expect(option.series[0]?.lineStyle.color).toBe('#111111');
		expect(option.series[1]?.lineStyle.color).toBe('#222222');
	});

	it('survives an empty window without throwing', () => {
		const option = buildTenantActivityOption([], palette);

		expect(option.xAxis.data).toEqual([]);
		expect(option.series[0]?.data).toEqual([]);
	});
});
