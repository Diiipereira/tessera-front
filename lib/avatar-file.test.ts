import { describe, expect, it } from 'vitest';
import { MAX_AVATAR_BYTES, readAsDataUri, refusalFor } from './avatar-file';

describe('refusalFor', () => {
	it('takes the three types Discord accepts', () => {
		expect(refusalFor({ type: 'image/png', size: 10 })).toBeNull();
		expect(refusalFor({ type: 'image/jpeg', size: 10 })).toBeNull();
		expect(refusalFor({ type: 'image/gif', size: 10 })).toBeNull();
	});

	it('turns away a type Discord would refuse, before anything is uploaded', () => {
		expect(refusalFor({ type: 'image/webp', size: 10 })).toBe('type');
		expect(refusalFor({ type: 'application/pdf', size: 10 })).toBe('type');
	});

	it('turns away a file over the limit, so the API never sees it', () => {
		expect(refusalFor({ type: 'image/png', size: MAX_AVATAR_BYTES + 1 })).toBe('size');
	});

	it('accepts a file exactly on the limit, because the limit is inclusive', () => {
		expect(refusalFor({ type: 'image/png', size: MAX_AVATAR_BYTES })).toBeNull();
	});

	it('checks the type before the size, so the message names the real problem', () => {
		expect(refusalFor({ type: 'image/webp', size: MAX_AVATAR_BYTES + 1 })).toBe('type');
	});
});

describe('readAsDataUri', () => {
	it('gives back what Discord wants, a base64 data uri', async () => {
		const file = new Blob([Uint8Array.from([0x89, 0x50, 0x4e, 0x47])], { type: 'image/png' });

		await expect(readAsDataUri(file)).resolves.toMatch(/^data:image\/png;base64,/);
	});
});
