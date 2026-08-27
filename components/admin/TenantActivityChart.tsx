'use client';

import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { SVGRenderer } from 'echarts/renderers';
import { useEffect, useRef } from 'react';
import { useTheme } from '@/components/providers/theme-context';
import { Alert } from '@/components/ui/Alert';
import { readChartToken } from '@/lib/chart-tokens';
import type { TenantDailyPoint } from '@/lib/types/admin';
import { cn } from '@/lib/utils/cn';
import {
	buildTenantActivityOption,
	isSilent,
	TENANT_SERIES_DOTS,
	TENANT_SERIES_KEYS,
	TENANT_SERIES_LABELS,
	type TenantChartPalette
} from './tenant-activity-option';

echarts.use([LineChart, GridComponent, TooltipComponent, SVGRenderer]);

function readPalette(): TenantChartPalette {
	const styles = getComputedStyle(document.documentElement);

	return {
		series: {
			messages: readChartToken(styles, '--chart-1'),
			commands: readChartToken(styles, '--chart-2')
		},
		axis: readChartToken(styles, '--border'),
		grid: readChartToken(styles, '--border'),
		text: readChartToken(styles, '--text-muted'),
		tooltipBg: readChartToken(styles, '--surface-raised'),
		tooltipFg: readChartToken(styles, '--text'),
		tooltipBorder: readChartToken(styles, '--border')
	};
}

export function TenantActivityChart({ points }: { points: TenantDailyPoint[] }) {
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
		chart.setOption(buildTenantActivityOption(points, readPalette()), true);
	}, [points, resolved]);

	return (
		<div className="flex flex-col rounded-lg border border-border bg-surface shadow-1">
			<div className="flex flex-wrap items-center gap-3 border-b border-border p-5">
				<div className="min-w-40 flex-1">
					<h2 className="text-h4">Activity</h2>
					<p className="text-body-sm text-text-muted">
						Thirty days of messages and commands. A flat line is the first thing to check when
						someone reports the bot stopped.
					</p>
				</div>

				<div className="flex flex-wrap gap-4">
					{TENANT_SERIES_KEYS.map((key) => (
						<span key={key} className="flex items-center gap-2 text-caption text-text-muted">
							<span
								aria-hidden="true"
								className={cn('size-2 rounded-full', TENANT_SERIES_DOTS[key])}
							/>
							{TENANT_SERIES_LABELS[key]}
						</span>
					))}
				</div>
			</div>

			{isSilent(points) ? (
				<div className="p-5">
					<Alert variant="warning" title="No recorded activity in the window">
						Nothing was written for this tenant in the last thirty days. Either the bot is not in
						the server any more, or it has no permission to see the channels.
					</Alert>
				</div>
			) : (
				<div className="px-3 py-4 ">
					<div
						ref={containerRef}
						data-testid="tenant-activity-chart"
						role="img"
						aria-label="Messages and commands over the last thirty days"
						className="h-56 w-full"
					/>
				</div>
			)}
		</div>
	);
}
