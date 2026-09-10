import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import enUS from '@/messages/en-US.json';
import ptBR from '@/messages/pt-BR.json';
import { Translated } from '@/tests/i18n';
import { useApiFailure } from './useApiFailure';

const describeIn = (locale: 'en-US' | 'pt-BR') =>
	renderHook(() => useApiFailure(), {
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
