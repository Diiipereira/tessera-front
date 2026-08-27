import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
	cleanup();
});

class ResizeObserverStub implements ResizeObserver {
	observe(): void {}
	unobserve(): void {}
	disconnect(): void {}
}

globalThis.ResizeObserver = ResizeObserverStub;

globalThis.matchMedia = (query: string): MediaQueryList => ({
	matches: false,
	media: query,
	onchange: null,
	addEventListener: () => undefined,
	removeEventListener: () => undefined,
	addListener: () => undefined,
	removeListener: () => undefined,
	dispatchEvent: () => false
});

const APPROX_GLYPH_WIDTH = 6;

HTMLCanvasElement.prototype.getContext = (() => ({
	measureText: (text: string) => ({ width: text.length * APPROX_GLYPH_WIDTH }),
	fillText: () => undefined,
	fillRect: () => undefined,
	clearRect: () => undefined,
	save: () => undefined,
	restore: () => undefined,
	setTransform: () => undefined,
	beginPath: () => undefined,
	closePath: () => undefined,
	stroke: () => undefined,
	fill: () => undefined
})) as unknown as typeof HTMLCanvasElement.prototype.getContext;
