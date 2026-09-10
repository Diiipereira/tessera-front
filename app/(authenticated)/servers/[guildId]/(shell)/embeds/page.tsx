import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { EmbedWorkshopSkeleton } from '@/components/skeletons/EmbedWorkshopSkeleton';
import { apiGet } from '@/lib/api';
import { ApiUnreachableError, resolveGuild } from '@/lib/guild-access';
import { loadChannels } from '@/lib/guild-shape';
import type { GuildPageProps } from '@/lib/types/page';
import type { GuildSettingsDto } from '@/lib/types/management';
import { EmbedWorkshopScreen } from './EmbedWorkshopScreen';

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations('embeds');

	return { title: t('title') };
}

export default async function Page({ params, searchParams }: GuildPageProps) {
	const [{ guildId }, query] = await Promise.all([params, searchParams]);
	await resolveGuild(guildId);

	if (query.state === 'loading') return <EmbedWorkshopSkeleton />;

	const [channels, settings] = await Promise.all([
		loadChannels(guildId),
		apiGet<GuildSettingsDto>(`/guilds/${guildId}/settings`)
	]);

	if (settings.status === 'unauthenticated') redirect('/login');

	if (settings.status === 'unreachable')
		throw new ApiUnreachableError(settings.reason, settings.answered, settings.code ?? null);

	return (
		<EmbedWorkshopScreen
			guildId={guildId}
			channels={channels}
			defaultColor={settings.data.embedColor}
			botName={settings.data.botNickname}
			botAvatarUrl={settings.data.botAvatarUrl}
		/>
	);
}
