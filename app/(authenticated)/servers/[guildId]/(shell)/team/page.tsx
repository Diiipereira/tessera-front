import { redirect } from 'next/navigation';
import { apiGet } from '@/lib/api';
import type { CapabilityCatalogDto } from '@/lib/api-url';
import { ApiUnreachableError } from '@/lib/guild-access';
import { mockInvites, mockTeam } from '@/lib/mock';
import { TeamScreen } from './TeamScreen';

export const metadata = { title: 'Team' };

export default async function Page() {
	const catalog = await apiGet<CapabilityCatalogDto>('/capabilities');

	if (catalog.status === 'unauthenticated') redirect('/login');
	if (catalog.status === 'unreachable') {
		throw new ApiUnreachableError(catalog.reason, catalog.answered);
	}

	return (
		<TeamScreen team={mockTeam} invites={mockInvites} viewerRole="owner" catalog={catalog.data} />
	);
}
