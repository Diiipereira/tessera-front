import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it } from 'vitest';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { mockActivity } from '@/lib/mock';
import { ActivityChart } from './ActivityChart';

function sizeContainers(width: number, height: number) {
	for (const property of ['clientWidth', 'offsetWidth'] as const) {
		Object.defineProperty(HTMLElement.prototype, property, {
			configurable: true,
			get: () => width
		});
	}
	for (const property of ['clientHeight', 'offsetHeight'] as const) {
		Object.defineProperty(HTMLElement.prototype, property, {
			configurable: true,
			get: () => height
		});
	}
}

beforeAll(() => {
	sizeContainers(800, 256);
});

function renderChart() {
	return render(
		<ThemeProvider>
			<ActivityChart data={mockActivity} />
		</ThemeProvider>
	);
}

async function seriesPaths(): Promise<SVGPathElement[]> {
	const container = screen.getByTestId('activity-chart');
	return waitFor(() => {
		const paths = Array.from(container.querySelectorAll('path')).filter(
			(path) => (path.getAttribute('d') ?? '').length > 0
		);
		expect(paths.length).toBeGreaterThan(0);
		return paths;
	});
}

describe('ActivityChart', () => {
	it('renders an SVG chart rather than an empty box', async () => {
		renderChart();
		const container = screen.getByTestId('activity-chart');
		await waitFor(() => {
			expect(container.querySelector('svg')).not.toBeNull();
		});
	});

	it('draws three visually distinct series', async () => {
		renderChart();
		const paths = await seriesPaths();

		const strokes = new Set(
			paths.map((path) => path.getAttribute('stroke')).filter((value): value is string => !!value)
		);
		const fills = new Set(
			paths
				.map((path) => path.getAttribute('fill'))
				.filter((value): value is string => !!value && value !== 'none')
		);

		expect(strokes.size).toBeGreaterThanOrEqual(3);
		expect(fills.size).toBeGreaterThanOrEqual(3);
	});

	it('draws three different shapes — the series are not duplicates of one another', async () => {
		renderChart();
		const paths = await seriesPaths();
		const shapes = new Set(paths.map((path) => path.getAttribute('d')));

		expect(shapes.size).toBeGreaterThanOrEqual(3);
	});

	it('labels every series in the legend', () => {
		renderChart();
		expect(screen.getByText('Messages')).toBeInTheDocument();
		expect(screen.getByText('Commands')).toBeInTheDocument();
		expect(screen.getByText('Joins')).toBeInTheDocument();
	});

	it('redraws when another range is picked', async () => {
		const user = userEvent.setup();
		renderChart();

		const before = (await seriesPaths()).map((path) => path.getAttribute('d')).join('|');

		await user.click(screen.getByRole('button', { name: '90d' }));

		await waitFor(async () => {
			const after = (await seriesPaths()).map((path) => path.getAttribute('d')).join('|');
			expect(after).not.toBe(before);
		});

		expect(screen.getByRole('button', { name: '90d' })).toHaveAttribute('aria-pressed', 'true');
		expect(screen.getByRole('button', { name: '7d' })).toHaveAttribute('aria-pressed', 'false');
	});
});
