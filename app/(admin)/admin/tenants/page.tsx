import type { Metadata } from 'next';
import { toTenantSummary } from '@/lib/admin-presentation';
import type { TenantSummaryDto } from '@/lib/api-url';
import { readAsStaff } from '../access';
import { Unreachable } from '../Unreachable';
import { TenantsScreen } from './TenantsScreen';

export const metadata: Metadata = { title: 'Tenants' };

export default async function Page() {
	const result = await readAsStaff<TenantSummaryDto[]>('/admin/tenants');

	if (result.status !== 'ok') {
		return <Unreachable reason={result.reason} />;
	}

	return <TenantsScreen tenants={result.data.map(toTenantSummary)} />;
}
