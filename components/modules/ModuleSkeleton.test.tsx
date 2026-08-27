import { readFileSync } from 'node:fs';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Skeleton, TextSkeleton } from '@/components/ui/Skeleton';
import {
	FieldSkeleton,
	ModulePageSkeleton,
	SectionSkeleton,
	SwitchSkeleton
} from './ModuleSkeleton';

function tokenFrom(block: string, name: string): string {
	const css = readFileSync('app/globals.css', 'utf8');
	const start = css.indexOf(`\n${block} {`);
	const body = css.slice(start, css.indexOf('\n}', start));
	const line = body.split('\n').find((entry) => entry.trim().startsWith(`--${name}:`));
	const value = line?.split(':')[1]?.trim().replace(';', '');
	if (value === undefined || !value.startsWith('#')) throw new Error(`${block} has no --${name}`);
	return value;
}

function toLinear(channel: number): number {
	const value = channel / 255;
	return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
	const n = Number.parseInt(hex.slice(1), 16);
	return (
		0.2126 * toLinear((n >> 16) & 255) +
		0.7152 * toLinear((n >> 8) & 255) +
		0.0722 * toLinear(n & 255)
	);
}

function ratio(a: string, b: string): number {
	const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05);
}

describe('Skeleton', () => {
	it('pulses and stays out of the accessibility tree', () => {
		const { container } = render(<Skeleton className="h-4 w-10" />);
		const piece = container.firstElementChild;

		expect(piece).toHaveClass('animate-pulse');
		expect(piece).toHaveAttribute('aria-hidden', 'true');
	});

	it('reads against the card it sits on in both themes', () => {
		for (const theme of [':root', '.dark']) {
			const card = tokenFrom(theme, 'surface');
			const piece = tokenFrom(theme, 'border');
			expect(ratio(card, piece)).toBeGreaterThan(1.2);
		}
	});
});

describe('ModuleSkeleton', () => {
	it('reproduces the module page frame, aside included', () => {
		const { container } = render(
			<ModulePageSkeleton label="Levels" headerAction aside={<div data-testid="aside" />}>
				<SectionSkeleton>
					<FieldSkeleton />
				</SectionSkeleton>
			</ModulePageSkeleton>
		);

		const root = container.firstElementChild;
		expect(root).toHaveAttribute('aria-busy', 'true');
		expect(root).toHaveAttribute('aria-label', 'Loading Levels');
		expect(screen.getByTestId('aside')).toBeInTheDocument();
		expect(container.querySelectorAll('section')).toHaveLength(1);
	});

	it('mirrors the real Field gaps so the control lands where it will render', () => {
		const { container } = render(<FieldSkeleton hint />);
		const [label, hintLine] = [...(container.firstElementChild?.children ?? [])];

		expect(label).toHaveClass('mb-0.5');
		expect(hintLine).toHaveClass('mb-1.5');
	});

	it('gives every text line the height of the type token it stands for', () => {
		const css = readFileSync('app/globals.css', 'utf8');
		const boxes: [string, string][] = [
			['h1', 'h-9'],
			['h2', 'h-8'],
			['h3', 'h-7'],
			['h4', 'h-6'],
			['body-lg', 'h-6.5'],
			['body', 'h-5.5'],
			['body-sm', 'h-5'],
			['caption', 'h-4'],
			['overline', 'h-3.5']
		];

		for (const [token, box] of boxes) {
			const line = css
				.split('\n')
				.find((entry) => entry.trim().startsWith(`--text-${token}--line-height:`));
			const px = Number.parseInt(line?.split(':')[1]?.trim() ?? '', 10);
			const rem = Number.parseFloat(box.replace('h-', ''));

			expect(rem * 4).toBe(px);
		}
	});

	it('centres the bar inside the line box so stacked lines never touch', () => {
		const { container } = render(<TextSkeleton line="h1" width="w-48" />);
		const box = container.firstElementChild;
		const bar = box?.firstElementChild;

		expect(box).toHaveClass('h-9');
		expect(box).toHaveClass('items-center');
		expect(bar).toHaveClass('h-7');
		expect(bar).toHaveClass('w-48');
	});

	it('drops the description line when the switch has none', () => {
		const pecas = (node: HTMLElement) => node.querySelectorAll('[aria-hidden="true"]').length;
		const comDescricao = pecas(render(<SwitchSkeleton />).container);
		const semDescricao = pecas(render(<SwitchSkeleton description={false} />).container);

		expect(comDescricao - semDescricao).toBe(1);
	});
});
