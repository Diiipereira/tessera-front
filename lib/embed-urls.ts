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

export function imageUrlHint(value: string): string | null {
	if (value.trim() === '') return null;

	if (!isHttpUrl(value)) return 'Use a link that starts with http:// or https://';

	if (!looksLikeImage(value)) {
		return 'This is not a direct image link — Discord will show nothing. It should end in .png, .jpg or .gif';
	}

	return null;
}
