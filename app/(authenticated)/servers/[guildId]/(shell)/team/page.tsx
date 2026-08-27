import { mockInvites, mockTeam } from '@/lib/mock';
import { TeamScreen } from './TeamScreen';

export const metadata = { title: 'Team' };

export default function Page() {
	return <TeamScreen team={mockTeam} invites={mockInvites} viewerRole="owner" />;
}
