export function configuredUrl(value: string | undefined): string | null {
	return value === undefined || value.trim() === '' ? null : value;
}

export const SUPPORT_HREF = configuredUrl(process.env.NEXT_PUBLIC_SUPPORT_URL);

export const STATUS_HREF = configuredUrl(process.env.NEXT_PUBLIC_STATUS_URL);
