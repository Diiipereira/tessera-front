import { resolveGuild } from '@/lib/guild-access';
import { ReactionRolesSkeleton } from '@/components/skeletons/ReactionRolesSkeleton';
import { mockChannels, mockReactionRolesConfig, mockRoles } from '@/lib/mock';
import type { GuildPageProps } from '@/lib/types/page';
import { ReactionRolesScreen } from './ReactionRolesScreen';

export const metadata = { title: 'Reaction roles' };

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);
	await resolveGuild(guildId);
	if (query.state === 'loading') return <ReactionRolesSkeleton />;

	return (
		<ReactionRolesScreen
			config={mockReactionRolesConfig}
			channels={mockChannels}
			roles={mockRoles}
		/>
	);
}
