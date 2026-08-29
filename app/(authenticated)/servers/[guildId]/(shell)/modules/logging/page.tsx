import { resolveGuild } from '@/lib/guild-access';
import { mockChannels, mockLoggingConfig, mockRoles } from '@/lib/mock';
import type { GuildPageProps } from '@/lib/types/page';
import { LoggingScreen } from './LoggingScreen';
import { LoggingSkeleton } from '@/components/skeletons/LoggingSkeleton';

export const metadata = { title: 'Logging' };

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);
	await resolveGuild(guildId);
	if (query.state === 'loading') return <LoggingSkeleton />;

	return <LoggingScreen config={mockLoggingConfig} channels={mockChannels} roles={mockRoles} />;
}
