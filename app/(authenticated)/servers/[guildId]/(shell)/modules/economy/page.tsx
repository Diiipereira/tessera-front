import { resolveGuild } from '@/lib/guild-access';
import { EconomySkeleton } from '@/components/skeletons/EconomySkeleton';
import { mockEconomyConfig, mockRoles, mockTransactions } from '@/lib/mock';
import type { GuildPageProps } from '@/lib/types/page';
import { EconomyScreen } from './EconomyScreen';

export const metadata = { title: 'Economy' };

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);
	await resolveGuild(guildId);
	if (query.state === 'loading') return <EconomySkeleton />;

	return (
		<EconomyScreen config={mockEconomyConfig} roles={mockRoles} transactions={mockTransactions} />
	);
}
