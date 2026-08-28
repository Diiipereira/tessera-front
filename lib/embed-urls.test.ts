import { describe, expect, it } from 'vitest';
import { expiresSoon, imageUrlIssue, isHttpUrl, looksLikeImage } from './embed-urls';

const SIGNED =
	'https://cdn.discordapp.com/attachments/1542349971838472263/1542350805926027274/Joker.jpg?ex=6a90e99f&is=6a8f981f&hm=7b8ea438ead871c7c6cc48dbbeeb8f17f1dc5c5c5f6df58c6205e6474bf987ad&';

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

describe('expiresSoon', () => {
	it('recognises a signed Discord attachment link', () => {
		expect(expiresSoon(SIGNED)).toBe(true);
	});

	it('leaves a plain link alone', () => {
		expect(expiresSoon('https://example.com/a.png')).toBe(false);
		expect(expiresSoon('https://example.com/a.png?v=2')).toBe(false);
	});

	it('needs the whole signature, not one stray parameter', () => {
		expect(expiresSoon('https://example.com/a.png?ex=1')).toBe(false);
		expect(expiresSoon('https://example.com/a.png?ex=1&is=2')).toBe(false);
	});
});

describe('imageUrlIssue', () => {
	it('stays quiet while the box is empty', () => {
		expect(imageUrlIssue('')).toBeNull();
		expect(imageUrlIssue('   ')).toBeNull();
	});

	it('stays quiet on a direct image link', () => {
		expect(imageUrlIssue('https://example.com/a.png')).toBeNull();
	});

	it('asks for a scheme when there is none', () => {
		expect(imageUrlIssue('example.com/a.png')).toBe('notHttp');
	});

	it('warns that Discord will render nothing for a page link', () => {
		expect(imageUrlIssue('https://imgur.com/gallery/abc')).toBe('notImage');
	});

	it('warns that a Discord attachment link will die on its own', () => {
		expect(imageUrlIssue(SIGNED)).toBe('expiring');
	});
});
