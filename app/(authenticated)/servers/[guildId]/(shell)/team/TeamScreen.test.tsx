import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { CapabilityCatalogDto } from '@/lib/api-url';
import { mockInvites, mockTeam } from '@/lib/mock';
import enUS from '@/messages/en-US.json';
import { Translated } from '@/tests/i18n';
import { TeamScreen } from './TeamScreen';

vi.mock('sonner', () => ({ toast: { success: () => undefined, error: () => undefined } }));

const catalog: CapabilityCatalogDto = {
	capabilities: [
		{
			key: 'modules.read',
			label: 'capabilities.modules.read.label',
			description: 'capabilities.modules.read.description'
		},
		{
			key: 'modules.write',
			label: 'capabilities.modules.write.label',
			description: 'capabilities.modules.write.description'
		}
	],
	roles: ['owner', 'admin', 'moderator', 'viewer'],
	presets: {
		owner: ['modules.read', 'modules.write'],
		admin: ['modules.read', 'modules.write'],
		moderator: ['modules.read'],
		viewer: ['modules.read']
	}
};

function renderScreen(over: Partial<CapabilityCatalogDto> = {}) {
	return render(
		<Translated>
			<TeamScreen
				team={mockTeam}
				invites={mockInvites}
				viewerRole="owner"
				catalog={{ ...catalog, ...over }}
			/>
		</Translated>
	);
}

const matrix = (): HTMLElement => {
	const heading = screen.getByRole('heading', { name: enUS.team.matrix.title });
	const section = heading.closest('section');

	if (section === null) throw new Error('the matrix section is not a section');

	return section;
};

describe('TeamScreen matrix', () => {
	it('lists one row per capability the API sent, not a list of its own', () => {
		renderScreen();

		const rows = within(matrix()).getAllByRole('row').slice(1);

		expect(rows).toHaveLength(catalog.capabilities.length);
	});

	it('names each capability from the dictionary, keyed by what the API sent', () => {
		renderScreen();

		expect(within(matrix()).getByText(enUS.capabilities.modules.read.label)).toBeDefined();
		expect(within(matrix()).getByText(enUS.capabilities.modules.write.label)).toBeDefined();
	});

	it('shrinks with the catalogue, which a hardcoded table could not do', () => {
		renderScreen({ capabilities: catalog.capabilities.slice(0, 1) });

		expect(within(matrix()).getAllByRole('row').slice(1)).toHaveLength(1);
	});

	it('counts the grants per seat from the preset the API sent', () => {
		renderScreen();

		const header = within(matrix()).getAllByRole('row')[0];

		expect(header?.textContent).toContain('2');
		expect(header?.textContent).toContain('1');
	});

	it('marks a capability granted for one seat and withheld for another', () => {
		renderScreen();

		const row = within(matrix())
			.getAllByRole('row')
			.find((entry) => entry.textContent.includes(enUS.capabilities.modules.write.label));

		expect(within(row as HTMLElement).getAllByText(enUS.team.granted)).toHaveLength(2);
		expect(within(row as HTMLElement).getAllByText(enUS.team.notGranted)).toHaveLength(2);
	});
});
