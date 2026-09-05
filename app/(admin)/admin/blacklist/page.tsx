import type { Metadata } from 'next';
import { toBlacklistEntries } from '@/lib/admin-presentation';
import type { BlacklistEntryDto } from '@/lib/api-url';
import { readAsStaff } from '../access';
import { Unreachable } from '../Unreachable';
import { BlacklistScreen } from './BlacklistScreen';

export const metadata: Metadata = { title: 'Blacklist' };

export default async function Page() {
	const result = await readAsStaff<BlacklistEntryDto[]>('/admin/blacklist');

	if (result.status !== 'ok') {
		return <Unreachable reason={result.reason} />;
	}

	return <BlacklistScreen entries={toBlacklistEntries(result.data)} />;
}
