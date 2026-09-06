import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BRAND } from '@/lib/brand';
import { SUPPORTED_LOCALES, type SupportedLocale } from '@/lib/locale';
import type { LockedReason } from '@/lib/types/discord';
import { Translated } from '@/tests/i18n';
import { useLockReason } from './lock-reason';

const REASONS: LockedReason[] = ['managed', 'aboveBot', 'noAccess'];

function Probe({ reason }: { reason: LockedReason }) {
	const lockReason = useLockReason();

	return <p>{lockReason(reason)}</p>;
}

function textOf(reason: LockedReason, locale: SupportedLocale): string {
	const view = render(
		<Translated locale={locale}>
			<Probe reason={reason} />
		</Translated>
	);

	const text = view.container.textContent;

	view.unmount();

	return text;
}

describe('useLockReason', () => {
	it('answers in the language of the reader, which a sentence built on the server never could', () => {
		for (const reason of REASONS) {
			expect(textOf(reason, 'pt-BR')).not.toBe(textOf(reason, 'en-US'));
		}
	});

	it('resolves every reason instead of printing the key back', () => {
		for (const locale of SUPPORTED_LOCALES) {
			for (const reason of REASONS) {
				const text = textOf(reason, locale);

				expect(text).not.toContain('pickers.locked');
				expect(text.length).toBeGreaterThan(0);
			}
		}
	});

	it('names the product in the reasons that speak about the bot', () => {
		for (const locale of SUPPORTED_LOCALES) {
			expect(textOf('aboveBot', locale)).toContain(BRAND.name);
			expect(textOf('noAccess', locale)).toContain(BRAND.name);
		}
	});
});
