export const CHART_FALLBACK = {
	'--chart-1': '#6b77f5',
	'--chart-2': '#0d9488',
	'--chart-3': '#d97706',
	'--border': '#e2e8f0',
	'--text-muted': '#64748b',
	'--text': '#0f172a',
	'--surface-raised': '#ffffff'
} as const;

export type ChartToken = keyof typeof CHART_FALLBACK;

export function readChartToken(styles: CSSStyleDeclaration, name: ChartToken): string {
	const value = styles.getPropertyValue(name).trim();
	return value === '' ? CHART_FALLBACK[name] : value;
}
