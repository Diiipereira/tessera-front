import { resolveGuild } from '@/lib/guild-access';
import { CustomCommandsSkeleton } from '@/components/skeletons/CustomCommandsSkeleton';
import { mockCustomCommandsConfig, mockRoles, mockVariables } from '@/lib/mock';
import { holdSkeleton } from '@/lib/skeleton-hold';
import type { GuildPageProps } from '@/lib/types/page';
import { CustomCommandsScreen } from './CustomCommandsScreen';

export const metadata = { title: 'Custom commands' };

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);
	await resolveGuild(guildId);
	if (query.state === 'loading') return <CustomCommandsSkeleton />;

	await holdSkeleton(query);

	return (
		<CustomCommandsScreen
			config={mockCustomCommandsConfig}
			roles={mockRoles}
			variables={mockVariables}
		/>
	);
}
