'use client';

import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import { useTranslations } from 'next-intl';
import { useEffect, useRef } from 'react';
import { useTheme } from '@/components/providers/theme-context';
import { buildCurve } from '@/lib/levels';
import { readChartToken } from '@/lib/chart-tokens';

echarts.use([LineChart, GridComponent, TooltipComponent, SVGRenderer]);

type LevelCurveChartProps = {
	curve: number;
	maxLevel?: number;
};

export function LevelCurveChart({ curve, maxLevel = 30 }: LevelCurveChartProps) {
	const t = useTranslations('modules.levels.chart');
	const { resolved } = useTheme();
	const containerRef = useRef<HTMLDivElement>(null);
	const chartRef = useRef<echarts.ECharts | null>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const chart = echarts.init(container, undefined, { renderer: 'svg' });
		chartRef.current = chart;

		const observer = new ResizeObserver(() => {
			chart.resize();
		});
		observer.observe(container);

		return () => {
			observer.disconnect();
			chart.dispose();
			chartRef.current = null;
		};
	}, []);

	useEffect(() => {
		const chart = chartRef.current;
		if (!chart) return;

		const styles = getComputedStyle(document.documentElement);
		const accent = readChartToken(styles, '--chart-1');
		const line = readChartToken(styles, '--border');
		const text = readChartToken(styles, '--text-muted');
		const points = buildCurve(maxLevel, curve);

		chart.setOption(
			{
				animationDuration: 220,
				grid: {
					left: 4,
					right: 8,
					top: 10,
					bottom: 0,
					outerBoundsMode: 'same',
					outerBoundsContain: 'axisLabel'
				},
				tooltip: {
					trigger: 'axis',
					backgroundColor: readChartToken(styles, '--surface-raised'),
					borderColor: line,
					borderWidth: 1,
					padding: [8, 10],
					textStyle: { color: readChartToken(styles, '--text'), fontSize: 12 },
					valueFormatter: (value: number) => `${value.toLocaleString('en-US')} XP`
				},
				xAxis: {
					type: 'category',
					data: points.map((point) => String(point.level)),
					boundaryGap: false,
					name: t('level'),
					nameLocation: 'middle',
					nameGap: 26,
					nameTextStyle: { color: text, fontSize: 11 },
					axisLine: { lineStyle: { color: line } },
					axisTick: { show: false },
					axisLabel: { color: text, fontSize: 11, interval: 4 },
					splitLine: { show: false }
				},
				yAxis: {
					type: 'value',
					splitNumber: 3,
					axisLine: { show: false },
					axisTick: { show: false },
					axisLabel: {
						color: text,
						fontSize: 11,
						formatter: (value: number) =>
							value >= 1000 ? `${String(Math.round(value / 1000))}k` : String(value)
					},
					splitLine: { lineStyle: { color: line } }
				},
				series: [
					{
						name: t('totalXp'),
						type: 'line',
						smooth: 0.3,
						symbol: 'none',
						lineStyle: { width: 2, color: accent },
						itemStyle: { color: accent },
						areaStyle: { color: accent, opacity: 0.12 },
						data: points.map((point) => point.totalXp)
					}
				]
			},
			true
		);
	}, [curve, maxLevel, resolved, t]);

	return (
		<div
			ref={containerRef}
			data-testid="level-curve"
			role="img"
			aria-label={`Total XP needed for each level up to ${String(maxLevel)}`}
			className="h-40 w-full"
		/>
	);
}
