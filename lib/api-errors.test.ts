import { describe, expect, it } from 'vitest';
import enUS from '@/messages/en-US.json';
import ptBR from '@/messages/pt-BR.json';
import { API_ERROR_CODES, failureFrom, isKnownCode, unreachable } from './api-errors';

const DICTIONARIES: Record<string, Record<string, string>> = {
	'en-US': enUS.errors,
	'pt-BR': ptBR.errors
};

describe('failureFrom', () => {
	it('keeps the code, which is what the dashboard translates', () => {
		expect(failureFrom({ error: { code: 'THRESHOLD_TAKEN', message: 'taken' } }, 409)).toEqual({
			code: 'THRESHOLD_TAKEN',
			fallback: 'taken'
		});
	});

	it('carries the fields the registry complained about', () => {
		const failure = failureFrom(
			{
				error: {
					code: 'CONFIG_INVALID',
					message: 'invalid',
					details: {
						issues: [
							{ path: 'message', message: 'Too big' },
							{ path: 'autoRoles', message: 'Too many' }
						]
					}
				}
			},
			400
		);

		expect(failure.fields).toEqual(['message', 'autoRoles']);
	});

	it('never leaves the screen without a code or something to show', () => {
		expect(failureFrom({}, 500)).toEqual({
			code: 'HTTP_500',
			fallback: 'The API answered 500'
		});
	});

	it('names a fetch that never left the browser', () => {
		expect(unreachable(new Error('offline'))).toEqual({
			code: 'UNREACHABLE',
			fallback: 'offline'
		});
	});

	it('does not claim to know a code the API invented after this build', () => {
		expect(isKnownCode('SOMETHING_NEW')).toBe(false);
	});
});

describe.each(Object.keys(DICTIONARIES))('the error sentences in %s', (locale) => {
	const copy = DICTIONARIES[locale] as Record<string, string>;

	it.each([...API_ERROR_CODES])('says something for %s', (code) => {
		expect(copy[code], code).toBeTypeOf('string');
		expect((copy[code] ?? '').trim()).not.toBe('');
	});

	it('writes no sentence for a code that cannot arrive', () => {
		const spare = Object.keys(copy).filter((key) => key !== 'fields' && !isKnownCode(key));

		expect(spare).toEqual([]);
	});
});
