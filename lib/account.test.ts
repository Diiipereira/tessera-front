import { describe, expect, it } from 'vitest';
import {
	browserOf,
	deviceKindOf,
	platformOf,
	toAccountSessions,
	type SessionSummaryDto
} from './account';

const UNKNOWN = 'Unknown';

const CHROME_WINDOWS =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

const SAFARI_IPHONE =
	'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

const FIREFOX_LINUX = 'Mozilla/5.0 (X11; Linux x86_64; rv:145.0) Gecko/20100101 Firefox/145.0';

const EDGE_WINDOWS =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0';

const dto = (patch: Partial<SessionSummaryDto> = {}): SessionSummaryDto => ({
	id: 'a'.repeat(64),
	current: false,
	createdAt: '2026-08-20T10:00:00.000Z',
	lastSeenAt: '2026-08-25T18:00:00.000Z',
	expiresAt: '2026-09-20T10:00:00.000Z',
	ip: '187.45.10.3',
	userAgent: CHROME_WINDOWS,
	...patch
});

describe('deviceKindOf', () => {
	it('reads a phone as a phone', () => {
		expect(deviceKindOf(SAFARI_IPHONE)).toBe('mobile');
	});

	it('reads a desktop browser as a desktop', () => {
		expect(deviceKindOf(CHROME_WINDOWS)).toBe('desktop');
	});

	it('falls back to desktop when there is no user agent to read', () => {
		expect(deviceKindOf(null)).toBe('desktop');
	});
});

describe('platformOf', () => {
	it('names the operating system', () => {
		expect(platformOf(CHROME_WINDOWS, UNKNOWN)).toBe('Windows');
		expect(platformOf(SAFARI_IPHONE, UNKNOWN)).toBe('iOS');
		expect(platformOf(FIREFOX_LINUX, UNKNOWN)).toBe('Linux');
	});

	it('says so when the agent is missing or unreadable', () => {
		expect(platformOf(null, UNKNOWN)).toBe(UNKNOWN);
		expect(platformOf('curl/8.4.0', UNKNOWN)).toBe(UNKNOWN);
	});
});

describe('browserOf', () => {
	it('names the browser', () => {
		expect(browserOf(CHROME_WINDOWS, UNKNOWN)).toBe('Chrome');
		expect(browserOf(FIREFOX_LINUX, UNKNOWN)).toBe('Firefox');
	});

	it('reads Edge as Edge, which also calls itself Chrome and Safari', () => {
		expect(browserOf(EDGE_WINDOWS, UNKNOWN)).toBe('Edge');
	});

	it('reads Safari as Safari, which Chrome also claims to be', () => {
		expect(browserOf(SAFARI_IPHONE, UNKNOWN)).toBe('Safari');
	});

	it('says so when the agent is missing or unreadable', () => {
		expect(browserOf(null, UNKNOWN)).toBe(UNKNOWN);
		expect(browserOf('curl/8.4.0', UNKNOWN)).toBe(UNKNOWN);
	});
});

describe('toAccountSessions', () => {
	it('describes the device from the agent the API stored', () => {
		expect(toAccountSessions([dto()], UNKNOWN)[0]).toMatchObject({
			deviceKind: 'desktop',
			device: 'Windows',
			browser: 'Chrome',
			ip: '187.45.10.3'
		});
	});

	it('keeps the id, which is what the revoke call needs', () => {
		expect(toAccountSessions([dto({ id: 'b'.repeat(64) })], UNKNOWN)[0]?.id).toBe('b'.repeat(64));
	});

	it('marks the session this browser is on', () => {
		const sessions = toAccountSessions([dto(), dto({ id: 'c', current: true })], UNKNOWN);

		expect(sessions.filter((session) => session.current)).toHaveLength(1);
	});

	it('shows a session with no address as unknown rather than as empty', () => {
		expect(toAccountSessions([dto({ ip: null })], UNKNOWN)[0]?.ip).toBe(UNKNOWN);
	});
});
