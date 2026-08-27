import type { Metadata } from 'next';
import { mockTenants } from '@/lib/mock';
import { TenantsScreen } from './TenantsScreen';

export const metadata: Metadata = { title: 'Tenants' };

export default function Page() {
	return <TenantsScreen tenants={mockTenants} />;
}
