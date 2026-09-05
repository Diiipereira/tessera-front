import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { toTenantDetail } from '@/lib/admin-presentation';
import type { TenantDetailDto } from '@/lib/api-url';
import { readAsStaff, type AdminRead } from '../../access';
import { Unreachable } from '../../Unreachable';
import { TenantScreen } from './TenantScreen';

const readTenant = cache((guildId: string): Promise<AdminRead<TenantDetailDto>> =>
	readAsStaff<TenantDetailDto>(`/admin/tenants/${guildId}`)
);

export async function generateMetadata({
	params
}: {
	params: Promise<{ guildId: string }>;
}): Promise<Metadata> {
	const { guildId } = await params;
	const result = await readTenant(guildId);

	return { title: result.status === 'ok' ? result.data.summary.name : 'Tenant' };
}

export default async function Page({ params }: { params: Promise<{ guildId: string }> }) {
	const { guildId } = await params;
	const result = await readTenant(guildId);

	if (result.status === 'missing') notFound();

	if (result.status === 'unreachable') {
		return <Unreachable reason={result.reason} />;
	}

	return <TenantScreen detail={toTenantDetail(result.data)} />;
}
