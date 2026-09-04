import type { AccountSession, SessionDeviceKind } from '@/lib/types/account';

export type SessionSummaryDto = {
	id: string;
	current: boolean;
	createdAt: string;
	lastSeenAt: string;
	expiresAt: string;
	ip: string | null;
	userAgent: string | null;
};

const MOBILE = /android|iphone|ipad|ipod|mobile|windows phone/i;

const PLATFORMS: readonly (readonly [RegExp, string])[] = [
	[/windows nt 10\.0/i, 'Windows'],
	[/windows/i, 'Windows'],
	[/iphone|ipad|ipod/i, 'iOS'],
	[/android/i, 'Android'],
	[/mac os x/i, 'macOS'],
	[/cros/i, 'ChromeOS'],
	[/linux/i, 'Linux']
];

const BROWSERS: readonly (readonly [RegExp, string])[] = [
	[/edg\//i, 'Edge'],
	[/opr\/|opera/i, 'Opera'],
	[/firefox\//i, 'Firefox'],
	[/chrome\//i, 'Chrome'],
	[/safari\//i, 'Safari']
];

const matched = (
	agent: string,
	table: readonly (readonly [RegExp, string])[],
	fallback: string
): string => table.find(([pattern]) => pattern.test(agent))?.[1] ?? fallback;

export const deviceKindOf = (userAgent: string | null): SessionDeviceKind =>
	userAgent !== null && MOBILE.test(userAgent) ? 'mobile' : 'desktop';

export const platformOf = (userAgent: string | null, unknown: string): string =>
	userAgent === null ? unknown : matched(userAgent, PLATFORMS, unknown);

export const browserOf = (userAgent: string | null, unknown: string): string =>
	userAgent === null ? unknown : matched(userAgent, BROWSERS, unknown);

export function toAccountSession(dto: SessionSummaryDto, unknown: string): AccountSession {
	return {
		id: dto.id,
		deviceKind: deviceKindOf(dto.userAgent),
		device: platformOf(dto.userAgent, unknown),
		browser: browserOf(dto.userAgent, unknown),
		ip: dto.ip ?? unknown,
		lastSeenAt: dto.lastSeenAt,
		current: dto.current
	};
}

export const toAccountSessions = (
	dtos: readonly SessionSummaryDto[],
	unknown: string
): AccountSession[] => dtos.map((dto) => toAccountSession(dto, unknown));
