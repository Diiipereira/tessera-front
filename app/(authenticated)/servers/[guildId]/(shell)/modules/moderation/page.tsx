import { resolveGuild } from '@/lib/guild-access';
import { mockModerationConfig, mockRoles } from '@/lib/mock';
import { holdSkeleton } from '@/lib/skeleton-hold';
import type { GuildPageProps } from '@/lib/types/page';
import { ModerationScreen } from './ModerationScreen';
import { ModerationSkeleton } from '@/components/skeletons/ModerationSkeleton';

export const metadata = { title: 'Moderation' };

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);
	await resolveGuild(guildId);
	if (query.state === 'loading') return <ModerationSkeleton />;

	await holdSkeleton(query);

	return <ModerationScreen config={mockModerationConfig} roles={mockRoles} />;
}
