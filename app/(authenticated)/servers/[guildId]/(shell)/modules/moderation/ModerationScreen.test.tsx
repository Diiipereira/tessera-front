import { render, screen } from '@testing-library/react';
import { createTranslator } from 'next-intl';
import { describe, expect, it } from 'vitest';
import { mockModerationConfig, mockRoles } from '@/lib/mock';
import type { SupportedLocale } from '@/lib/locale';
import enUS from '@/messages/en-US.json';
import ptBR from '@/messages/pt-BR.json';
import { Translated } from '@/tests/i18n';
import { ModerationScreen } from './ModerationScreen';

const DICTIONARIES = { 'en-US': enUS, 'pt-BR': ptBR };

const KEY_PATH = /modules\.moderation\.[a-z]+(?:\.[a-z]+)+/i;

function show(locale: SupportedLocale = 'en-US') {
	render(<ModerationScreen config={mockModerationConfig} roles={mockRoles} />, {
		wrapper: ({ children }) => <Translated locale={locale}>{children}</Translated>
	});
}

const copyFor = (locale: SupportedLocale) => DICTIONARIES[locale].modules.moderation;

describe('ModerationScreen', () => {
	it.each(['en-US', 'pt-BR'] as const)('reads end to end in %s', (locale) => {
		show(locale);

		const copy = copyFor(locale);

		expect(screen.getByRole('heading', { name: copy.title, level: 1 })).toBeInTheDocument();
		expect(screen.getByText(copy.who.title)).toBeInTheDocument();
		expect(screen.getByText(copy.defaults.title)).toBeInTheDocument();
		expect(screen.getByText(copy.escalation.title)).toBeInTheDocument();
	});

	it.each(['en-US', 'pt-BR'] as const)('leaks no message key into the page in %s', (locale) => {
		show(locale);

		expect(document.body.textContent).not.toMatch(KEY_PATH);
	});

	it('keeps the product variables literal in the DM hint, braces and all', () => {
		show();

		const t = createTranslator({
			locale: 'en-US',
			messages: enUS,
			namespace: 'modules.moderation'
		});
		const hint = t('dm.messageHint');

		expect(hint).toContain('{action}');
		expect(hint).toContain('{server}');
		expect(screen.getByText(hint)).toBeInTheDocument();
	});

	it('names each escalation duration in words, not as the stored code', () => {
		show('pt-BR');

		const t = createTranslator({ locale: 'pt-BR', messages: ptBR, namespace: 'durations' });

		expect(screen.getAllByText(t('24h')).length).toBeGreaterThan(0);
	});
});
