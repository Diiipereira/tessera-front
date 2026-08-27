import type { Metadata } from 'next';
import { mockBlacklist } from '@/lib/mock';
import { BlacklistScreen } from './BlacklistScreen';

export const metadata: Metadata = { title: 'Blacklist' };

export default function Page() {
	return <BlacklistScreen entries={mockBlacklist} />;
}
