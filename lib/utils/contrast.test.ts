import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrastRatio, luminance, readableTextOn } from '@/lib/utils/contrast';

function tokenFrom(block: string, name: string): string {
	const css = readFileSync('app/globals.css', 'utf8');
	const start = css.indexOf(`\n${block} {`);
	const body = css.slice(start, css.indexOf('\n}', start));
	const match = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,8})\\s*;`).exec(body);
	if (!match?.[1]) throw new Error(`${block} has no --${name}`);
	return match[1];
}

const onLight = tokenFrom(':root', 'on-light');
const onDark = tokenFrom(':root', 'on-dark');

const AVATAR_COLOURS = [
	'#5865f2',
	'#db2777',
	'#8b5cf6',
	'#ed4245',
	'#0d9488',
	'#eb459e',
	'#d97706',
	'#3ba55d',
	'#f87171',
	'#a78bfa',
	'#f472b6',
	'#94a3b8',
	'#60a5fa',
	'#e879f9',
	'#fb923c',
	'#38bdf8',
	'#34d399',
	'#22d3ee',
	'#4ade80',
	'#fbbf24',
	'#facc15',
	'#5eead4',
	'#57f287',
	'#fee75c'
];

describe('readableTextOn', () => {
	it('puts dark text on a light background', () => {
		expect(readableTextOn('#fbbf24')).toBe('text-on-light');
	});

	it('puts light text on a dark background', () => {
		expect(readableTextOn('#5865f2')).toBe('text-on-dark');
	});

	it('accepts shorthand hex', () => {
		expect(readableTextOn('#fff')).toBe('text-on-light');
	});

	it('never picks the worse of the two, for any colour the app can render', () => {
		const worse: string[] = [];

		for (const colour of AVATAR_COLOURS) {
			const picked = readableTextOn(colour) === 'text-on-light' ? onLight : onDark;
			const rejected = picked === onLight ? onDark : onLight;
			if (contrastRatio(colour, picked) < contrastRatio(colour, rejected)) worse.push(colour);
		}

		expect(worse).toEqual([]);
	});

	it('flips exactly where the two token colours tie, so the threshold cannot drift', () => {
		const tie = Math.sqrt((luminance(onDark) + 0.05) * (luminance(onLight) + 0.05)) - 0.05;
		const grey = (byte: number) => `#${byte.toString(16).padStart(2, '0').repeat(3)}`;

		const flip = [...Array(256).keys()].find(
			(byte) => readableTextOn(grey(byte)) === 'text-on-light'
		);
		if (flip === undefined || flip === 0) throw new Error('readableTextOn never flips');

		expect(luminance(grey(flip - 1))).toBeLessThanOrEqual(tie);
		expect(luminance(grey(flip))).toBeGreaterThanOrEqual(tie);
	});
});
