import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LOCALE_COOKIE, LOCALE_SHORT_NAMES, SUPPORTED_LOCALES } from '@/lib/locale';
import enUS from '@/messages/en-US.json';
import ptBR from '@/messages/pt-BR.json';
import { Translated } from '@/tests/i18n';
import { LocaleToggle } from './LocaleToggle';

const refresh = vi.fn();

vi.mock('next/navigation', () => ({
	useRouter: () => ({ refresh: () => refresh() as unknown })
}));

const forget = () => {
	document.cookie = `${LOCALE_COOKIE}=; path=/; max-age=0`;
};

describe('LocaleToggle', () => {
	beforeEach(() => {
		refresh.mockClear();
		forget();
	});

	it('offers every locale the app supports, so adding one cannot miss the header', () => {
		expect(LOCALE_SHORT_NAMES.map((option) => option.locale).toSorted()).toEqual(
			[...SUPPORTED_LOCALES].toSorted()
		);
	});

	it('marks the language the app is actually rendering in', () => {
		render(<LocaleToggle />, { wrapper: Translated });

		expect(
			screen.getByRole('button', {
				name: enUS.shell.switchTo.replace('{language}', enUS.locales['en-US'])
			})
		).toHaveAttribute('aria-pressed', 'true');
	});

	it('remembers the choice in this browser and asks the server for the new language', async () => {
		const user = userEvent.setup();

		render(<LocaleToggle />, { wrapper: Translated });

		await user.click(
			screen.getByRole('button', {
				name: enUS.shell.switchTo.replace('{language}', enUS.locales['pt-BR'])
			})
		);

		expect(document.cookie).toContain(`${LOCALE_COOKIE}=pt-BR`);
		expect(refresh).toHaveBeenCalledOnce();
	});

	it('does nothing when the language is already the one showing', async () => {
		const user = userEvent.setup();

		render(<LocaleToggle />, { wrapper: Translated });

		await user.click(
			screen.getByRole('button', {
				name: enUS.shell.switchTo.replace('{language}', enUS.locales['en-US'])
			})
		);

		expect(document.cookie).not.toContain(LOCALE_COOKIE);
		expect(refresh).not.toHaveBeenCalled();
	});

	it('speaks the language it is rendered in', () => {
		render(
			<Translated locale="pt-BR">
				<LocaleToggle />
			</Translated>
		);

		expect(screen.getByRole('group', { name: ptBR.shell.language })).toBeInTheDocument();
	});
});
