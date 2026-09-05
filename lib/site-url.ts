const FALLBACK_SITE_URL = 'http://localhost:3000';

export function siteBaseUrl(): string {
	const configured = process.env.NEXT_PUBLIC_SITE_URL;

	return configured === undefined || configured === '' ? FALLBACK_SITE_URL : configured;
}

export function absoluteUrl(path: string): string {
	return new URL(path, siteBaseUrl()).toString();
}
