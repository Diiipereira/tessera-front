import { render as rtlRender, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { mockTenants } from '@/lib/mock/admin';
import { TenantsScreen } from './TenantsScreen';

import type { ReactElement } from 'react';
import { Translated } from '@/tests/i18n';

const render = (ui: ReactElement) => rtlRender(ui, { wrapper: Translated });

function rows() {
	return screen.getAllByRole('link', { name: /·/ });
}

describe('TenantsScreen', () => {
	it('opens on the active tenants, not on everything ever installed', () => {
		render(<TenantsScreen tenants={mockTenants} />);

		const active = mockTenants.filter((tenant) => tenant.leftAt === null);
		expect(rows()).toHaveLength(active.length);
	});

	it('finds a tenant by the guild id support was handed', async () => {
		const user = userEvent.setup();
		render(<TenantsScreen tenants={mockTenants} />);

		await user.type(screen.getByLabelText('Search tenants'), '842315097461823104');

		expect(rows()).toHaveLength(1);
		expect(screen.getByText('Pixel Foundry')).toBeInTheDocument();
	});

	it('finds every tenant belonging to one owner', async () => {
		const user = userEvent.setup();
		render(<TenantsScreen tenants={mockTenants} />);

		await user.type(screen.getByLabelText('Search tenants'), 'kaya');

		expect(rows().length).toBeGreaterThan(1);
	});

	it('reveals the tenants that left when the filter is switched', async () => {
		const user = userEvent.setup();
		render(<TenantsScreen tenants={mockTenants} />);

		await user.click(screen.getByRole('button', { name: 'Left' }));

		const gone = mockTenants.filter((tenant) => tenant.leftAt !== null);
		expect(rows()).toHaveLength(gone.length);
		expect(screen.getAllByText('Left').length).toBeGreaterThan(1);
	});

	it('says so instead of showing an empty table when nothing matches', async () => {
		const user = userEvent.setup();
		render(<TenantsScreen tenants={mockTenants} />);

		await user.type(screen.getByLabelText('Search tenants'), 'no-such-server');

		expect(screen.getByText('No tenant matches')).toBeInTheDocument();
	});

	it('links each row to that tenant', () => {
		render(<TenantsScreen tenants={mockTenants} />);

		expect(screen.getByText('Pixel Foundry').closest('a')).toHaveAttribute(
			'href',
			'/admin/tenants/842315097461823104'
		);
	});

	it('flags a tenant that never finished setup', () => {
		render(<TenantsScreen tenants={mockTenants} />);

		const pending = mockTenants.filter(
			(tenant) => !tenant.setupCompleted && tenant.leftAt === null
		);
		expect(screen.getAllByText('Setup')).toHaveLength(pending.length);
	});
});
