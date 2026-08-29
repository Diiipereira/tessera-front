import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import enUS from '@/messages/en-US.json';
import ptBR from '@/messages/pt-BR.json';
import { Translated } from '@/tests/i18n';
import { useRelativeTime } from './useRelativeTime';

const NOW = new Date('2026-08-28T10:00:00.000Z');

const formatterFor = (locale: 'en-US' | 'pt-BR') =>
	renderHook(() => useRelativeTime(), {
		wrapper: ({ children }) => <Translated locale={locale}>{children}</Translated>
	}).result.current;

describe('useRelativeTime', () => {
	it('speaks the reader locale, which a hand-rolled formatter never did', () => {
		expect(formatterFor('pt-BR')('2026-08-27T10:00:00.000Z', NOW)).toBe('há 1 dia');
		expect(formatterFor('en-US')('2026-08-27T10:00:00.000Z', NOW)).toBe('1 day ago');
	});

	it('translates the just-now window instead of leaving English in the table', () => {
		const seconds = '2026-08-28T09:59:50.000Z';

		expect(formatterFor('pt-BR')(seconds, NOW)).toBe(ptBR.common.justNow);
		expect(formatterFor('en-US')(seconds, NOW)).toBe(enUS.common.justNow);
	});

	it('formats a future instant too, which the invite list used to concatenate by hand', () => {
		expect(formatterFor('pt-BR')('2026-09-04T10:00:00.000Z', NOW)).toBe('em 1 semana');
		expect(formatterFor('en-US')('2026-09-04T10:00:00.000Z', NOW)).toBe('in 1 week');
	});

	it('says unknown in the reader locale for a date it cannot parse', () => {
		expect(formatterFor('pt-BR')('not a date', NOW)).toBe(ptBR.common.unknownTime);
		expect(formatterFor('en-US')(null, NOW)).toBe(enUS.common.unknownTime);
	});
});
