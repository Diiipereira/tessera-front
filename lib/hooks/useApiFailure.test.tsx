import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import enUS from '@/messages/en-US.json';
import ptBR from '@/messages/pt-BR.json';
import { Translated } from '@/tests/i18n';
import { ConfigSaveError } from './useConfigDraft';
import { useApiFailure, useThrownFailure } from './useApiFailure';

const describeIn = (locale: 'en-US' | 'pt-BR') =>
	renderHook(() => useApiFailure(), {
		wrapper: ({ children }) => <Translated locale={locale}>{children}</Translated>
	}).result.current;

const explainIn = (locale: 'en-US' | 'pt-BR') =>
	renderHook(() => useThrownFailure(), {
		wrapper: ({ children }) => <Translated locale={locale}>{children}</Translated>
	}).result.current;

describe('useApiFailure', () => {
	it('says the sentence of the guild language, not the one the API wrote', () => {
		const failure = { code: 'THRESHOLD_TAKEN', fallback: 'This guild already has a rule' };

		expect(describeIn('pt-BR')(failure)).toBe(ptBR.errors.THRESHOLD_TAKEN);
		expect(describeIn('en-US')(failure)).toBe(enUS.errors.THRESHOLD_TAKEN);
	});

	it('names the fields the registry complained about', () => {
		const said = describeIn('en-US')({
			code: 'CONFIG_INVALID',
			fallback: 'invalid',
			fields: ['message', 'autoRoles']
		});

		expect(said).toContain(enUS.errors.CONFIG_INVALID);
		expect(said).toContain('message, autoRoles');
	});

	it('shows what the API said when the code is newer than this build', () => {
		expect(describeIn('pt-BR')({ code: 'INVENTED_TOMORROW', fallback: 'Something odd' })).toBe(
			'Something odd'
		);
	});
});

describe('useThrownFailure', () => {
	it('translates the failure a rejected save carries, instead of the English it was built with', () => {
		const thrown = new ConfigSaveError({
			code: 'INVALID_REACTION_PANEL',
			fallback: 'A panel needs a name the staff can recognise'
		});

		expect(explainIn('pt-BR')(thrown)).toBe(ptBR.errors.INVALID_REACTION_PANEL);
		expect(explainIn('en-US')(thrown)).toBe(enUS.errors.INVALID_REACTION_PANEL);
	});

	it('blames our own side for anything else, and never repeats the raw message', () => {
		const thrown = new Error('Cannot read properties of undefined');

		expect(explainIn('pt-BR')(thrown)).toBe(ptBR.errors.INTERNAL_ERROR);
		expect(explainIn('pt-BR')(thrown)).not.toContain('undefined');
		expect(explainIn('en-US')('a string nobody typed for a reader')).toBe(
			enUS.errors.INTERNAL_ERROR
		);
	});
});
