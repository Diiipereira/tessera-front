const ON_LIGHT_CROSSOVER = 0.1985;

function toLinear(channel: number): number {
	return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string): number {
	const value = hex.replace('#', '');
	const full =
		value.length === 3
			? value
					.split('')
					.map((char) => char + char)
					.join('')
			: value;
	const r = toLinear(Number.parseInt(full.slice(0, 2), 16) / 255);
	const g = toLinear(Number.parseInt(full.slice(2, 4), 16) / 255);
	const b = toLinear(Number.parseInt(full.slice(4, 6), 16) / 255);
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
	const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05);
}

export function readableTextOn(background: string): string {
	return luminance(background) > ON_LIGHT_CROSSOVER ? 'text-on-light' : 'text-on-dark';
}
