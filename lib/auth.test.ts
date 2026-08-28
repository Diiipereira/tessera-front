import { describe, expect, it } from 'vitest';
import { callbackFailureFor, loginErrorFor, LOGIN_ERROR_KINDS } from './auth';
import enUS from '@/messages/en-US.json';
import ptBR from '@/messages/pt-BR.json';

describe('loginErrorFor', () => {
	it('says nothing when the URL carries no error', () => {
		expect(loginErrorFor(null)).toBeNull();
	});

	it('keeps the kind the URL named, so the screen can name the cause', () => {
		expect(loginErrorFor('access_denied')).toBe('access_denied');
		expect(loginErrorFor('session_expired')).toBe('session_expired');
	});

	it('falls back to unknown rather than showing a raw query parameter', () => {
		expect(loginErrorFor('something_new_from_discord')).toBe('unknown');
	});
});

describe('callbackFailureFor', () => {
	it('says nothing when the URL carries no error', () => {
		expect(callbackFailureFor(null, 'ref')).toBeNull();
	});

	it('shows the Discord code, which is not the same as our kind', () => {
		expect(callbackFailureFor('unknown', 'abc')).toEqual({
			kind: 'unknown',
			code: 'server_error',
			reference: 'abc'
		});
	});

	it('carries the reference through, because support asks for it', () => {
		expect(callbackFailureFor('invalid_grant', '8f21c04e')).toEqual({
			kind: 'invalid_grant',
			code: 'invalid_grant',
			reference: '8f21c04e'
		});
	});

	it('falls back to unknown for a code Discord has not shown us yet', () => {
		expect(callbackFailureFor('teapot', 'ref')?.kind).toBe('unknown');
	});
});

describe('every kind the module can return', () => {
	const KINDS = ['invalid_grant', 'invalid_state', 'unknown'] as const;

	it('has a login message in both dictionaries, or the screen renders a key path', () => {
		for (const kind of LOGIN_ERROR_KINDS) {
			expect(enUS.auth.errors[kind].title).toBeTruthy();
			expect(enUS.auth.errors[kind].body).toBeTruthy();
			expect(ptBR.auth.errors[kind].title).toBeTruthy();
			expect(ptBR.auth.errors[kind].body).toBeTruthy();
		}
	});

	it('has a callback reason in both dictionaries', () => {
		for (const kind of KINDS) {
			expect(enUS.auth.failures[kind]).toBeTruthy();
			expect(ptBR.auth.failures[kind]).toBeTruthy();
		}
	});
});
