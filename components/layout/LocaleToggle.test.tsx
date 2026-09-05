import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LOCALE_COOKIE, LOCALE_SHORT_NAMES, SUPPORTED_LOCALES } from '@/lib/locale';
import type * as LocaleClient from '@/lib/locale-client';
import enUS from '@/messages/en-US.json';
import ptBR from '@/messages/pt-BR.json';
import { Translated } from '@/tests/i18n';
import { LocaleToggle } from './LocaleToggle';

const refresh = vi.fn();
const path = { current: '/servers/1/modules/welcome' };

vi.mock('next/navigation', () => ({
	useRouter: () => ({ refresh: () => refresh() as unknown }),
	usePathname: () => path.current
}));

const leave = vi.fn();

vi.mock('@/lib/locale-client', async (importOriginal) => ({
	...(await importOriginal<typeof LocaleClient>()),
	loadDocument: (href: string) => {
		leave(href);
	}
}));

const forget = () => {
	document.cookie = `${LOCALE_COOKIE}=; path=/; max-age=0`;
};

const switchTo = (locale: keyof typeof enUS.locales) =>
	screen.getByRole('button', {
		name: enUS.shell.switchTo.replace('{language}', enUS.locales[locale])
	});

describe('LocaleToggle', () => {
	beforeEach(() => {
		refresh.mockClear();
		leave.mockClear();
		path.current = '/servers/1/modules/welcome';
		forget();
	});

	it('offers every locale the app supports, so adding one cannot miss the header', () => {
		expect(LOCALE_SHORT_NAMES.map((option) => option.locale).toSorted()).toEqual(
			[...SUPPORTED_LOCALES].toSorted()
		);
	});

	it('marks the language the app is actually rendering in', () => {
		render(<LocaleToggle />, { wrapper: Translated });

		expect(switchTo('en-US')).toHaveAttribute('aria-pressed', 'true');
	});

	it('remembers the choice in this browser and asks the server for the new language', async () => {
		const user = userEvent.setup();

		render(<LocaleToggle />, { wrapper: Translated });

		await user.click(switchTo('pt-BR'));

		expect(document.cookie).toContain(`${LOCALE_COOKIE}=pt-BR`);
		expect(refresh).toHaveBeenCalledOnce();
		expect(leave).not.toHaveBeenCalled();
	});

	it('loads the other language as a new document, because the chrome and lang live above the route', async () => {
		const user = userEvent.setup();

		path.current = '/docs/en/modules/welcome';

		render(<LocaleToggle />, { wrapper: Translated });

		await user.click(switchTo('pt-BR'));

		expect(leave).toHaveBeenCalledWith('/docs/pt/modules/welcome');
		expect(refresh).not.toHaveBeenCalled();
		expect(document.cookie).toContain(`${LOCALE_COOKIE}=pt-BR`);
	});

	it('does nothing when the language is already the one showing', async () => {
		const user = userEvent.setup();

		render(<LocaleToggle />, { wrapper: Translated });

		await user.click(switchTo('en-US'));

		expect(document.cookie).not.toContain(LOCALE_COOKIE);
		expect(refresh).not.toHaveBeenCalled();
		expect(leave).not.toHaveBeenCalled();
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
