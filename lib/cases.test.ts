import { describe, expect, it } from 'vitest';
import { caseStatus, colorOf, displayName, durationParts, initialsOf } from './cases';
import type { CaseParticipant, ModerationCase } from './types/management';

const NOW = new Date('2026-08-29T12:00:00.000Z');

const person = (over: Partial<CaseParticipant> = {}): CaseParticipant => ({
	id: '444444444444444444',
	name: 'Tigre',
	handle: 'tigre',
	avatarHash: null,
	...over
});

const entry = (over: Partial<ModerationCase> = {}): ModerationCase => ({
	id: 'uuid-1',
	number: 1,
	type: 'warn',
	target: person(),
	moderator: person({ id: '555555555555555555', name: 'Lia', handle: 'lia' }),
	reason: 'Spam',
	durationSeconds: null,
	expiresAt: null,
	active: true,
	revokedAt: null,
	revokedBy: null,
	revokeReason: null,
	createdAt: '2026-08-29T10:00:00.000Z',
	...over
});

describe('caseStatus', () => {
	it('calls a standing punishment standing', () => {
		expect(caseStatus(entry(), NOW)).toBe('standing');
	});

	it('calls a lifted case revoked, whatever else is true of it', () => {
		expect(caseStatus(entry({ revokedAt: '2026-08-29T11:00:00.000Z' }), NOW)).toBe('revoked');
	});

	it('reads revoked before done, so a lifted ban does not read as merely finished', () => {
		const lifted = entry({ active: false, revokedAt: '2026-08-29T11:00:00.000Z' });

		expect(caseStatus(lifted, NOW)).toBe('revoked');
	});

	it('calls a kick done, because it left nothing standing', () => {
		expect(caseStatus(entry({ type: 'kick', active: false }), NOW)).toBe('done');
	});

	it('calls a timeout expired once its end has passed', () => {
		const past = entry({ type: 'timeout', expiresAt: '2026-08-29T11:00:00.000Z' });

		expect(caseStatus(past, NOW)).toBe('expired');
	});

	it('still calls it standing while the end is in the future', () => {
		const future = entry({ type: 'timeout', expiresAt: '2026-08-29T13:00:00.000Z' });

		expect(caseStatus(future, NOW)).toBe('standing');
	});

	it('treats the exact instant of expiry as expired, not as one second more', () => {
		const exact = entry({ type: 'timeout', expiresAt: NOW.toISOString() });

		expect(caseStatus(exact, NOW)).toBe('expired');
	});
});

describe('displayName', () => {
	it('prefers the display name Discord shows', () => {
		expect(displayName(person())).toBe('Tigre');
	});

	it('falls back to the handle when there is no display name', () => {
		expect(displayName(person({ name: null }))).toBe('tigre');
	});

	it('shows the id rather than nothing when the account is unknown', () => {
		expect(displayName(person({ name: null, handle: null }))).toBe('444444444444444444');
	});
});

describe('initialsOf', () => {
	it('takes the first letter of the name, uppercased', () => {
		expect(initialsOf(person())).toBe('T');
	});

	it('falls back to a question mark rather than an empty avatar', () => {
		expect(initialsOf(person({ name: null, handle: null }))).toBe('?');
	});
});

describe('colorOf', () => {
	it('gives the same person the same colour every render', () => {
		expect(colorOf(person())).toBe(colorOf(person()));
	});

	it('answers with a colour even for an id it has never seen', () => {
		expect(colorOf(person({ id: '1' }))).toMatch(/^#[0-9a-f]{6}$/);
	});
});

describe('durationParts', () => {
	it('reads whole days as days', () => {
		expect(durationParts(86400)).toEqual({ unit: 'day', count: 1 });
		expect(durationParts(604800)).toEqual({ unit: 'day', count: 7 });
	});

	it('reads whole hours as hours', () => {
		expect(durationParts(3600)).toEqual({ unit: 'hour', count: 1 });
	});

	it('reads whole minutes as minutes', () => {
		expect(durationParts(300)).toEqual({ unit: 'minute', count: 5 });
	});

	it('falls back to seconds for anything that does not divide evenly', () => {
		expect(durationParts(90)).toEqual({ unit: 'second', count: 90 });
	});

	it('prefers the largest unit that fits, so a week is seven days not 168 hours', () => {
		expect(durationParts(604800).unit).toBe('day');
	});
});
