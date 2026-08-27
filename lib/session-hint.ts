export const SIGNED_IN_HINT_COOKIE = 'tessera-signed-in';

export function hasSignedInHint(cookieHeader: string): boolean {
	return cookieHeader
		.split(';')
		.map((entry) => entry.trim())
		.some((entry) => entry === `${SIGNED_IN_HINT_COOKIE}=1`);
}

export function readSignedInHint(): boolean {
	if (typeof document === 'undefined') return false;
	return hasSignedInHint(document.cookie);
}
