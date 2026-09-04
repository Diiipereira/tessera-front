import { redirect } from 'next/navigation';
import { AutoModSkeleton } from '@/components/skeletons/AutoModSkeleton';
import { apiGet } from '@/lib/api';
import type { GuildModuleStateDto } from '@/lib/api-url';
import { ApiUnreachableError, resolveGuild } from '@/lib/guild-access';
import { loadChannels, loadRoles } from '@/lib/guild-shape';
import { toAutoModConfig, type AutomodRuleDto } from '@/lib/modules/automod';
import type { GuildPageProps } from '@/lib/types/page';
import { AutoModScreen } from './AutoModScreen';

export const metadata = { title: 'AutoMod' };

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);
	await resolveGuild(guildId);

	if (query.state === 'loading') return <AutoModSkeleton />;

	const [state, rules, channels, roles] = await Promise.all([
		apiGet<GuildModuleStateDto>(`/guilds/${guildId}/modules/automod`),
		apiGet<{ rules: AutomodRuleDto[] }>(`/guilds/${guildId}/automod`),
		loadChannels(guildId),
		loadRoles(guildId)
	]);

	if (state.status === 'unauthenticated' || rules.status === 'unauthenticated') redirect('/login');

	if (state.status === 'unreachable')
		throw new ApiUnreachableError(state.reason, state.answered, state.code ?? null);

	if (rules.status === 'unreachable')
		throw new ApiUnreachableError(rules.reason, rules.answered, rules.code ?? null);

	return (
		<AutoModScreen
			guildId={guildId}
			config={toAutoModConfig(state.data, rules.data.rules)}
			version={state.data.version}
			channels={channels}
			roles={roles}
		/>
	);
}
