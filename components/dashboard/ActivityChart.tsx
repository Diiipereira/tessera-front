'use client';

import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/components/providers/theme-context';
import { readChartToken } from '@/lib/chart-tokens';
import type { ActivityPoint, ActivityRange } from '@/lib/types/overview';
import { cn } from '@/lib/utils/cn';
import {
	buildActivityOption,
	SERIES_DOTS,
	SERIES_KEYS,
	type ChartPalette,
	type SeriesLabels
} from './activity-option';

echarts.use([LineChart, GridComponent, TooltipComponent, SVGRenderer]);

const RANGES: ActivityRange[] = ['7d', '30d', '90d'];

const segment = 'h-7 rounded-sm px-2.5 text-caption transition-colors duration-120 ease-out';

function readPalette(): ChartPalette {
	const styles = getComputedStyle(document.documentElement);
	return {
		series: {
			messages: readChartToken(styles, '--chart-1'),
			commands: readChartToken(styles, '--chart-2'),
			joins: readChartToken(styles, '--chart-3')
		},
		axis: readChartToken(styles, '--border'),
		grid: readChartToken(styles, '--border'),
		text: readChartToken(styles, '--text-muted'),
		tooltipBg: readChartToken(styles, '--surface-raised'),
		tooltipFg: readChartToken(styles, '--text'),
		tooltipBorder: readChartToken(styles, '--border')
	};
}

type ActivityChartProps = {
	data: Record<ActivityRange, ActivityPoint[]>;
};

export function ActivityChart({ data }: ActivityChartProps) {
	const t = useTranslations('overview.activity');
	const { resolved } = useTheme();
	const [range, setRange] = useState<ActivityRange>('7d');
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
		const labels: SeriesLabels = {
			messages: t('messages'),
			commands: t('commands'),
			joins: t('joins')
		};
		chart.setOption(buildActivityOption(data[range], readPalette(), labels), true);
	}, [data, range, resolved, t]);

	return (
		<div className="flex flex-col rounded-lg border border-border bg-surface shadow-1">
			<div className="flex flex-wrap items-center gap-3 border-b border-border p-5">
				<div className="min-w-40 flex-1">
					<h2 className="text-h4">{t('title')}</h2>
					<p className="text-body-sm text-text-muted">{t('description')}</p>
				</div>

				<div
					role="group"
					aria-label={t('rangeLabel')}
					className="flex items-center gap-0.5 rounded-md border border-border bg-surface-sunken p-0.5"
				>
					{RANGES.map((option) => (
						<button
							key={option}
							type="button"
							aria-pressed={range === option}
							className={cn(
								segment,
								range === option
									? 'bg-primary-subtle text-primary'
									: 'text-text-muted hover:text-text'
							)}
							onClick={() => {
								setRange(option);
							}}
						>
							{option}
						</button>
					))}
				</div>
			</div>

			<div className="flex flex-wrap gap-4 px-5 pt-4">
				{SERIES_KEYS.map((key) => (
					<span key={key} className="flex items-center gap-2 text-caption text-text-muted">
						<span aria-hidden="true" className={cn('size-2 rounded-full', SERIES_DOTS[key])} />
						{t(key)}
					</span>
				))}
			</div>

			<div className="px-3 pt-3 pb-4">
				<div
					ref={containerRef}
					data-testid="activity-chart"
					role="img"
					aria-label={t('chartLabel')}
					className="h-64 w-full"
				/>
			</div>
		</div>
	);
}
