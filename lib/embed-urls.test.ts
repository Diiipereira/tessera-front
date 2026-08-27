import { describe, expect, it } from 'vitest';
import { imageUrlHint, isHttpUrl, looksLikeImage } from './embed-urls';

describe('isHttpUrl', () => {
	it('accepts http and https', () => {
		expect(isHttpUrl('https://example.com/a.png')).toBe(true);
		expect(isHttpUrl('http://example.com/a.png')).toBe(true);
	});

	it('refuses other schemes and bare hostnames', () => {
		expect(isHttpUrl('javascript:alert(1)')).toBe(false);
		expect(isHttpUrl('data:image/png;base64,AAAA')).toBe(false);
		expect(isHttpUrl('example.com/a.png')).toBe(false);
	});
});

describe('looksLikeImage', () => {
	it('recognises the extensions Discord renders', () => {
		expect(looksLikeImage('https://example.com/a.png')).toBe(true);
		expect(looksLikeImage('https://example.com/a.JPG')).toBe(true);
		expect(looksLikeImage('https://example.com/a.gif')).toBe(true);
		expect(looksLikeImage('https://example.com/a.webp')).toBe(true);
	});

	it('ignores the query string, which the Discord CDN always adds', () => {
		expect(looksLikeImage('https://cdn.discordapp.com/x/y.png?ex=1&is=2&hm=3')).toBe(true);
	});

	it('says no to a page that merely contains an image', () => {
		expect(looksLikeImage('https://imgur.com/gallery/abc')).toBe(false);
	});
});

describe('imageUrlHint', () => {
	it('stays quiet while the box is empty', () => {
		expect(imageUrlHint('')).toBeNull();
		expect(imageUrlHint('   ')).toBeNull();
	});

	it('stays quiet on a direct image link', () => {
		expect(imageUrlHint('https://example.com/a.png')).toBeNull();
	});

	it('asks for a scheme when there is none', () => {
		expect(imageUrlHint('example.com/a.png')).toContain('http://');
	});

	it('warns that Discord will render nothing for a page link', () => {
		expect(imageUrlHint('https://imgur.com/gallery/abc')).toContain('direct image link');
	});
});
