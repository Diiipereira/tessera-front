import { CommandsSkeleton } from '@/components/skeletons/CommandsSkeleton';
import { mockChannels, mockCommands, mockRoles } from '@/lib/mock';
import { holdSkeleton } from '@/lib/skeleton-hold';
import type { GuildPageProps } from '@/lib/types/page';
import { CommandsScreen } from './CommandsScreen';

export const metadata = { title: 'Commands' };

export default async function Page({ searchParams }: Pick<GuildPageProps, 'searchParams'>) {
	const query = await searchParams;
	if (query.state === 'loading') return <CommandsSkeleton />;

	await holdSkeleton(query);

	return (
		<CommandsScreen
			commands={mockCommands}
			roles={mockRoles}
			channels={mockChannels}
			lastSyncedAt="2026-08-25T09:02:00.000Z"
		/>
	);
}
