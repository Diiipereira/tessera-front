export const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp'] as const;

export function isHttpUrl(value: string): boolean {
	try {
		const url = new URL(value.trim());

		return url.protocol === 'http:' || url.protocol === 'https:';
	} catch {
		return false;
	}
}

export function looksLikeImage(value: string): boolean {
	try {
		const path = new URL(value.trim()).pathname.toLowerCase();

		return IMAGE_EXTENSIONS.some((extension) => path.endsWith(extension));
	} catch {
		return false;
	}
}

export const SIGNED_PARAMS = ['ex', 'is', 'hm'] as const;

export function expiresSoon(value: string): boolean {
	try {
		const url = new URL(value.trim());

		return SIGNED_PARAMS.every((param) => url.searchParams.has(param));
	} catch {
		return false;
	}
}

export type ImageUrlIssue = 'notHttp' | 'notImage' | 'expiring';

export function imageUrlIssue(value: string): ImageUrlIssue | null {
	if (value.trim() === '') return null;

	if (!isHttpUrl(value)) return 'notHttp';

	if (!looksLikeImage(value)) return 'notImage';

	if (expiresSoon(value)) return 'expiring';

	return null;
}
