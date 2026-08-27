import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { NavigationProvider } from '@/components/providers/NavigationProvider';
import { SidebarProvider } from '@/components/providers/SidebarProvider';
import { TooltipProvider } from '@/components/ui/tooltip-provider';
import { guildHref, navGroups } from '@/lib/navigation';
import { Translated } from '@/tests/i18n';
import { SidebarNav } from './SidebarNav';

const GUILD_ID = '1';

const pathname = vi.hoisted(() => ({ current: '/servers/1' }));

vi.mock('next/navigation', () => ({
	usePathname: () => pathname.current
}));

function renderNav(at: string) {
	pathname.current = at;
	return render(
		<Translated>
			<TooltipProvider>
				<SidebarProvider>
					<NavigationProvider>
						<SidebarNav guildId={GUILD_ID} collapsible />
					</NavigationProvider>
				</SidebarProvider>
			</TooltipProvider>
		</Translated>
	);
}

describe('SidebarNav', () => {
	it('renders every destination once', () => {
		renderNav('/servers/1');
		const expected = navGroups.flatMap((group) => group.items).length;
		expect(screen.getAllByRole('link')).toHaveLength(expected);
	});

	it('points each item at its guild-scoped route', () => {
		renderNav('/servers/1');
		expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute(
			'href',
			guildHref(GUILD_ID, '')
		);
		expect(screen.getByRole('link', { name: 'Audit log' })).toHaveAttribute(
			'href',
			guildHref(GUILD_ID, '/audit')
		);
	});

	it('keeps every item at its full 40px height instead of letting flex shrink it', () => {
		renderNav('/servers/1');
		for (const link of screen.getAllByRole('link')) {
			expect(link).toHaveClass('h-10');
			expect(link).toHaveClass('shrink-0');
		}
	});

	it('marks only the current route as the active page', () => {
		renderNav(guildHref(GUILD_ID, '/members'));

		const active = screen.getByRole('link', { name: 'Members' });
		expect(active).toHaveAttribute('aria-current', 'page');

		const others = screen
			.getAllByRole('link')
			.filter((link) => link.getAttribute('aria-current') === 'page');
		expect(others).toHaveLength(1);
	});

	it('does not mark the modules index active while on a module page', () => {
		renderNav(guildHref(GUILD_ID, '/modules/welcome'));

		expect(screen.getByRole('link', { name: 'Welcome' })).toHaveAttribute('aria-current', 'page');
		expect(screen.getByRole('link', { name: 'Modules' })).not.toHaveAttribute('aria-current');
	});

	it('flags premium items so they read differently from the rest', () => {
		renderNav('/servers/1');
		expect(screen.getAllByLabelText('Premium')).toHaveLength(
			navGroups.flatMap((group) => group.items).filter((item) => item.premium).length
		);
	});
});
