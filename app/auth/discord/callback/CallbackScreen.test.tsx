import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { callbackFailureFor } from '@/lib/auth';
import type { SupportedLocale } from '@/lib/locale';
import enUS from '@/messages/en-US.json';
import ptBR from '@/messages/pt-BR.json';
import { Translated } from '@/tests/i18n';
import { CallbackScreen } from './CallbackScreen';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

const REFERENCE = '8f21c04e';

function renderCallback(kind: string | null, locale: SupportedLocale = 'en-US') {
	render(
		<Translated locale={locale}>
			<CallbackScreen failure={callbackFailureFor(kind, REFERENCE)} />
		</Translated>
	);
}

describe('CallbackScreen', () => {
	it('waits quietly while the handshake finishes', () => {
		renderCallback(null);

		expect(screen.getByRole('heading', { name: enUS.auth.connectingAccount })).toBeInTheDocument();
		expect(screen.queryByRole('link', { name: enUS.auth.tryAgain })).not.toBeInTheDocument();
	});

	it('shows the Discord code next to a reason a person can act on', () => {
		renderCallback('invalid_grant');

		expect(screen.getByRole('heading', { name: enUS.auth.failedTitle })).toBeInTheDocument();
		expect(screen.getByText('invalid_grant')).toBeInTheDocument();
		expect(screen.getByText(new RegExp(enUS.auth.failures.invalid_grant))).toBeInTheDocument();
	});

	it('offers the reference, because that is what support asks for', () => {
		renderCallback('invalid_state');

		expect(screen.getByText(`ref ${REFERENCE}`)).toBeInTheDocument();
	});

	it('gives a way out — retry and home — instead of a dead end', () => {
		renderCallback('unknown');

		expect(screen.getByRole('link', { name: enUS.auth.tryAgain })).toHaveAttribute(
			'href',
			'/login'
		);
		expect(screen.getByRole('link', { name: enUS.auth.backHome })).toHaveAttribute('href', '/');
	});

	it('translates the failure, and keeps the Discord code untranslated', () => {
		renderCallback('invalid_grant', 'pt-BR');

		expect(screen.getByRole('heading', { name: ptBR.auth.failedTitle })).toBeInTheDocument();
		expect(screen.getByText(new RegExp(ptBR.auth.failures.invalid_grant))).toBeInTheDocument();
		expect(screen.getByText('invalid_grant')).toBeInTheDocument();
	});
});
