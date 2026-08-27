import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { findTenant } from '@/lib/mock';
import { TenantScreen } from './TenantScreen';

export async function generateMetadata({
	params
}: {
	params: Promise<{ guildId: string }>;
}): Promise<Metadata> {
	const { guildId } = await params;
	const detail = findTenant(guildId);

	return { title: detail === null ? 'Tenant' : detail.summary.name };
}

export default async function Page({ params }: { params: Promise<{ guildId: string }> }) {
	const { guildId } = await params;
	const detail = findTenant(guildId);
	if (detail === null) notFound();

	return <TenantScreen detail={detail} />;
}
