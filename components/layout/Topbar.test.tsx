import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { NavigationProvider } from '@/components/providers/NavigationProvider';
import { SidebarProvider } from '@/components/providers/SidebarProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { mockGuilds, mockUser } from '@/lib/mock';
import enUS from '@/messages/en-US.json';
import { Translated } from '@/tests/i18n';
import { Topbar } from './Topbar';

const guild = mockGuilds[0] as (typeof mockGuilds)[number];

vi.mock('next/navigation', () => ({
	usePathname: () => `/servers/${mockGuilds[0]?.id ?? '1'}`,
	useRouter: () => ({ refresh: () => undefined, push: () => undefined })
}));

function renderBar() {
	const { container } = render(
		<Translated>
			<ThemeProvider>
				<SidebarProvider>
					<NavigationProvider>
						<Topbar
							guild={guild}
							user={mockUser}
							onSearch={() => undefined}
							onOpenAccount={() => undefined}
							accountTriggerRef={createRef<HTMLButtonElement>()}
						/>
					</NavigationProvider>
				</SidebarProvider>
			</ThemeProvider>
		</Translated>
	);

	return container.querySelector('header') as HTMLElement;
}

describe('Topbar', () => {
	it('gives the search its own middle column, so it sits centred', () => {
		const header = renderBar();
		const search = screen.getByRole('button', { name: new RegExp(enUS.shell.searchOrJump) });
		const cells = [...header.children];

		expect(cells).toHaveLength(3);
		expect(cells[1]?.contains(search)).toBe(true);
	});

	it('lets the breadcrumbs give way before the toggles do, so nothing is ever squashed', () => {
		const header = renderBar();

		expect(header.className).toContain('grid-cols-[minmax(0,1fr)_auto_1fr]');
	});

	it('puts the language beside the theme, on the far side from the breadcrumbs', () => {
		const header = renderBar();
		const language = screen.getByRole('group', { name: enUS.shell.language });
		const theme = screen.getByRole('group', { name: enUS.shell.theme });

		expect(header.children[2]?.contains(language)).toBe(true);
		expect(header.children[2]?.contains(theme)).toBe(true);
	});
});
